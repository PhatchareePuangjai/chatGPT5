process.env.DB_PATH = ":memory:";

const request = require("supertest");
const { app, db } = require("../server");

const seed = () =>
  new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run("DELETE FROM products", (err) => {
        if (err) return reject(err);
        db.run(
          `INSERT INTO products (id, name, price, stock) VALUES
            (1, 'SKU-001', 100, 10),
            (2, 'SKU-002', 200, 6),
            (3, 'SKU-003', 300, 5),
            (4, 'SKU-004', 400, 1),
            (5, 'SKU-005', 500, 5),
            (6, 'SKU-006', 600, 7)`,
          (err) => (err ? reject(err) : resolve())
        );
      });
    });
  });

const getProduct = async (id) => {
  const res = await request(app).get("/products");
  return res.body.find((p) => p.id === id);
};

describe("Inventory System Tests (IMBP02)", () => {
  beforeEach(async () => {
    await seed();
  });

  afterAll((done) => {
    db.close(done);
  });

  // ─── Acceptance Tests ─────────────────────────────────────────────────────

  test("Test 1: Successful Stock Deduction", async () => {
    const res = await request(app).post("/buy/1").send({ quantity: 2 });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("OK");

    const product = await getProduct(1);
    expect(product.stock).toBe(8);
  });

  test("Test 2: Low Stock Alert Trigger", async () => {
    // SKU-002 stock=6, buy 2 -> 4 (ควร trigger alert เพราะ 4 <= 5)
    await request(app).post("/buy/2").send({ quantity: 2 }).expect(200);

    const product = await getProduct(2);
    expect(product.stock).toBe(4);
    // alert เป็น console.log เท่านั้น ไม่มี response field
    // code ใช้ newStock < 5 ดังนั้น 4 < 5 => trigger ✅
  });

  test("Test 3: Stock Restoration (No Restock Endpoint)", async () => {
    // IMBP02 ไม่มี endpoint cancel/restock
    // ทดสอบ: buy 1 แล้ว stock ลด — แต่ไม่สามารถ restore ได้
    await request(app).post("/buy/3").send({ quantity: 1 }).expect(200);
    const after = await getProduct(3);
    expect(after.stock).toBe(4);

    // ไม่มี restock API: ไม่สามารถ restore stock กลับ 5 ได้
    // Scenario นี้ไม่สามารถ test ครบได้ใน IMBP02
  });

  // ─── Edge Cases ───────────────────────────────────────────────────────────

  test("Edge Case 1: Race Condition", async () => {
    // SKU-004 stock=1, ยิง 5 concurrent requests
    // expected: 1 success, 4 fail (stock ไม่ติดลบ)
    const requests = Array(5)
      .fill(null)
      .map(() => request(app).post("/buy/4").send({ quantity: 1 }));

    const results = await Promise.all(requests);

    const successCount = results.filter((r) => r.status === 200).length;
    const failCount = results.filter((r) => r.status === 400).length;

    // code ไม่มี DB locking -> คาดว่า race condition จะเกิด
    expect(successCount).toBe(1);
    expect(failCount).toBe(4);

    const product = await getProduct(4);
    expect(product.stock).toBeGreaterThanOrEqual(0); // ห้ามติดลบ
    expect(product.stock).toBe(0);
  });

  test("Edge Case 2: Transaction Atomicity", async () => {
    // IMBP02 ไม่มี InventoryLog/stock_history และไม่มี Transaction wrapping
    // ทดสอบ: buy สำเร็จ -> stock ลดถูกต้อง (แต่ไม่มี log บันทึก)
    await request(app).post("/buy/1").send({ quantity: 1 }).expect(200);

    const product = await getProduct(1);
    expect(product.stock).toBe(9);

    // ไม่มี InventoryLog table: atomicity (all-or-nothing) ไม่ได้ implement
  });

  test("Edge Case 3: Overselling Attempt", async () => {
    // SKU-005 stock=5, สั่งซื้อ 6 ชิ้น
    const res = await request(app).post("/buy/5").send({ quantity: 6 });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Not enough stock");

    const product = await getProduct(5);
    expect(product.stock).toBe(5); // stock ต้องไม่เปลี่ยน
  });

  test("Edge Case 4: Boundary Value (Low Stock Threshold ≤ 5)", async () => {
    // SKU-006 stock=7, threshold คือ ≤ 5
    // 7 -> 6: ไม่ควร alert
    await request(app).post("/buy/6").send({ quantity: 1 }).expect(200);
    // 6 -> 5: ควร alert (≤ 5) แต่ code ใช้ < 5 (strict) จึงไม่ alert
    await request(app).post("/buy/6").send({ quantity: 1 }).expect(200);
    // 5 -> 4: alert ✅ (4 < 5)
    await request(app).post("/buy/6").send({ quantity: 1 }).expect(200);

    const product = await getProduct(6);
    expect(product.stock).toBe(4);
    // Bug: เมื่อ stock = 5 (เท่ากับ threshold) code ไม่ alert เพราะใช้ < แทน <=
  });
});

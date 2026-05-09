const request = require("supertest");
const { app, resetInventory, inventory, stockHistory } = require("../server");

describe("Inventory System Tests - IMBP02", () => {
  beforeEach(() => resetInventory());

  // ── Acceptance Tests ────────────────────────────────────────────────────────

  test("Test 1: Successful Stock Deduction", async () => {
    // id=1 (Laptop) stock=10, buy 2 → should be 8
    const res = await request(app)
      .post("/api/inventory/purchase/1")
      .send({ quantity: 2 })
      .expect(200);

    expect(res.body.message).toBe("Purchase successful");

    const item = inventory.find(i => i.id === 1);
    expect(item.stock).toBe(8);

    // InventoryLog ต้องมี type "SALE" จำนวน -2
    const log = stockHistory.find(h => h.itemId === 1 && h.change === -2);
    expect(log).toBeDefined();
    expect(log.type).toBe("SALE"); // FAIL: server ไม่ set field type
  });

  test("Test 2: Low Stock Alert Trigger", async () => {
    // id=2 (Mouse) stock=6, threshold=5, buy 2 → 4 (ต้องแจ้งเตือน)
    const res = await request(app)
      .post("/api/inventory/purchase/2")
      .send({ quantity: 2 })
      .expect(200);

    const item = inventory.find(i => i.id === 2);
    expect(item.stock).toBe(4);

    const lowRes = await request(app).get("/api/inventory/low-stock").expect(200);
    expect(lowRes.body.find(i => i.id === 2)).toBeDefined();
  });

  test("Test 3: Stock Restoration", async () => {
    // id=3 (Keyboard) stock=5, buy 1 → 4, restock 1 → 5
    await request(app)
      .post("/api/inventory/purchase/3")
      .send({ quantity: 1 })
      .expect(200);

    const res = await request(app)
      .post("/api/inventory/restock/3") // FAIL: endpoint ไม่มีใน server
      .send({ quantity: 1 });

    expect(res.status).toBe(200);

    const item = inventory.find(i => i.id === 3);
    expect(item.stock).toBe(5);

    const log = stockHistory.find(h => h.itemId === 3 && h.change === 1);
    expect(log).toBeDefined();
    expect(log.type).toBe("RESTOCK"); // FAIL: server ไม่ set field type
  });

  // ── Edge Case Tests ─────────────────────────────────────────────────────────

  test("Edge Case 1: Race Condition", async () => {
    // id=4 (Monitor) stock=1, 5 concurrent requests to buy 1
    const requests = Array(5).fill().map(() =>
      request(app).post("/api/inventory/purchase/4").send({ quantity: 1 })
    );
    const results = await Promise.all(requests);

    const successCount = results.filter(r => r.status === 200).length;
    const failCount    = results.filter(r => r.status !== 200).length;

    expect(successCount).toBe(1);
    expect(failCount).toBe(4);
    expect(inventory.find(i => i.id === 4).stock).toBe(0);
  });

  test("Edge Case 2: Transaction Atomicity", async () => {
    // In-memory ไม่มี real transaction — ตรวจว่า stock + log consistent เสมอ
    await request(app)
      .post("/api/inventory/purchase/1")
      .send({ quantity: 1 })
      .expect(200);

    const item = inventory.find(i => i.id === 1);
    expect(item.stock).toBe(9);

    const log = stockHistory.find(h => h.itemId === 1 && h.change === -1);
    expect(log).toBeDefined();
  });

  test("Edge Case 3: Overselling Attempt", async () => {
    // id=5 (Headset) stock=5, buy 6 → ต้องถูกปฏิเสธ
    const res = await request(app)
      .post("/api/inventory/purchase/5")
      .send({ quantity: 6 });

    expect(res.status).toBe(400);
    expect(inventory.find(i => i.id === 5).stock).toBe(5);
  });

  test("Edge Case 4: Boundary Value (threshold <= 5)", async () => {
    // id=6 (Webcam) stock=7, threshold=5
    // 7 → 6: ไม่แจ้งเตือน
    await request(app).post("/api/inventory/purchase/6").send({ quantity: 1 }).expect(200);
    let low = (await request(app).get("/api/inventory/low-stock")).body;
    expect(low.find(i => i.id === 6)).toBeUndefined();

    // 6 → 5: ต้องแจ้งเตือน (5 <= 5)
    await request(app).post("/api/inventory/purchase/6").send({ quantity: 1 }).expect(200);
    low = (await request(app).get("/api/inventory/low-stock")).body;
    expect(low.find(i => i.id === 6)).toBeDefined(); // FAIL: server ใช้ < 5 ไม่ใช่ <= 5

    // 5 → 4: ต้องแจ้งเตือน
    await request(app).post("/api/inventory/purchase/6").send({ quantity: 1 }).expect(200);
    low = (await request(app).get("/api/inventory/low-stock")).body;
    expect(low.find(i => i.id === 6)).toBeDefined();
  });
});

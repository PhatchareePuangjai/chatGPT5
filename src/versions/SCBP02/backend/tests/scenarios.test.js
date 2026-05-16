const supertest = require("supertest");

describe("Shopping Cart Scenarios", () => {
  let request;

  beforeEach(() => {
    jest.resetModules();
    const app = require("./testApp");
    request = supertest(app);
  });

  // Scenario 1: Update Item Quantity
  test("Scenario 1: Update Item Quantity", async () => {
    // Given: Item A (price 100) x 1 in cart
    await request
      .post("/api/cart/add")
      .send({ id: "SKU-001", name: "Product A", price: 100, quantity: 1 })
      .expect(200);

    // When: Update quantity to 3
    const res = await request
      .put("/api/cart/update")
      .send({ id: "SKU-001", quantity: 3 })
      .expect(200);

    // Then:
    // 1) Quantity updated to 3
    const item = res.body.cart.items.find((i) => i.id === "SKU-001");
    expect(item.quantity).toBe(3);
    // 2) Line total = 300
    expect(item.price * item.quantity).toBe(300);
    // 3) Grand total = 300
    expect(res.body.totalPrice).toBe(300);
  });

  // Scenario 2: Merge Items Logic
  test("Scenario 2: Merge Items Logic", async () => {
    // Given: SKU-001 x 1 already in cart
    await request
      .post("/api/cart/add")
      .send({ id: "SKU-001", name: "Product A", price: 100, quantity: 1 })
      .expect(200);

    // When: Add SKU-001 x 2 again
    const res = await request
      .post("/api/cart/add")
      .send({ id: "SKU-001", name: "Product A", price: 100, quantity: 2 })
      .expect(200);

    // Then:
    // 1) No duplicate rows
    const matchingItems = res.body.cart.items.filter((i) => i.id === "SKU-001");
    expect(matchingItems.length).toBe(1);
    // 2) Quantity merged (1 + 2 = 3)
    expect(matchingItems[0].quantity).toBe(3);
  });

  // Scenario 3: Save for Later
  test("Scenario 3: Save for Later", async () => {
    // Given: SKU-005 in cart
    await request
      .post("/api/cart/add")
      .send({ id: "SKU-005", name: "Product E", price: 50, quantity: 1 })
      .expect(200);

    // When: Save for later
    const res = await request
      .post("/api/cart/save")
      .send({ id: "SKU-005" })
      .expect(200);

    // Then:
    // 1) Removed from active cart
    const activeItem = res.body.cart.items.find((i) => i.id === "SKU-005");
    expect(activeItem).toBeUndefined();
    // 2) Total reduced to 0
    expect(res.body.totalPrice).toBe(0);
    // 3) Moved to savedForLater
    const savedItem = res.body.cart.savedForLater.find((i) => i.id === "SKU-005");
    expect(savedItem).toBeDefined();
  });

  // Edge Case 1: Add More Than Stock
  test("Edge 1: Add More Than Stock", async () => {
    // Context: SKU-005 stock = 5. Cart already has 3.
    await request
      .post("/api/cart/add")
      .send({ id: "SKU-005", name: "Product E", price: 50, quantity: 3 })
      .expect(200);

    // Test: Try to add 3 more (total would be 6, exceeds stock 5)
    // SCBP02 has no stock validation -> expected FAIL (gets 200 instead of error)
    const res = await request
      .post("/api/cart/add")
      .send({ id: "SKU-005", name: "Product E", price: 50, quantity: 3 });

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/Not enough stock|สินค้าไม่เพียงพอ/);

    // Verify cart quantity remains at 3
    const cartRes = await request.get("/api/cart").expect(200);
    const item = cartRes.body.items.find((i) => i.id === "SKU-005");
    expect(item.quantity).toBe(3);
  });

  // Edge Case 2: Floating Point Calculation
  test("Edge 2: Floating Point Calculation", async () => {
    // Context: price 19.99 x 3 = expected 59.97
    // SCBP02 uses direct multiplication (no cent-based precision) -> may produce floating point error
    const res = await request
      .post("/api/cart/add")
      .send({ id: "SKU-006", name: "Product F", price: 19.99, quantity: 3 })
      .expect(200);

    expect(res.body.totalPrice).toBe(59.97);
  });
});

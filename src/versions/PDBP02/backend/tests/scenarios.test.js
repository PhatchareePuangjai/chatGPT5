const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("./test-app");
const Coupon = require("../models/Coupon");

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

beforeEach(async () => {
  await Coupon.deleteMany({});
  const yesterday = new Date(Date.now() - 86400000);
  const tomorrow = new Date(Date.now() + 86400000);

  await Coupon.insertMany([
    // SAVE100: 10% discount → 100 baht off on 1000 baht cart
    { code: "SAVE100", discountPercentage: 10, expirationDate: tomorrow, isActive: true },
    // EXPIRED: expired yesterday
    { code: "EXPIRED", discountPercentage: 10, expirationDate: yesterday, isActive: true },
    // WELCOME: 200% discount → used to trigger negative total on 50 baht cart
    { code: "WELCOME", discountPercentage: 200, expirationDate: tomorrow, isActive: true },
  ]);
});

describe("Promotions and Discounts Scenarios", () => {
  // Scenario 1: Coupon Validation
  test("1) Coupon Validation: SAVE100 gives 10% off on 1000 baht cart", async () => {
    const res = await request(app)
      .post("/api/promotions/apply-coupon")
      .send({ code: "SAVE100", cartTotal: 1000 })
      .expect(200);

    expect(res.body.discountAmount).toBe(100);  // 1000 * 10% = 100
    expect(res.body.newTotal).toBe(900);
    expect(res.body.message).toMatch(/success/i);
    // NOTE: min purchase check (500 baht) does NOT exist in PDBP02 — not enforced
  });

  // Scenario 2: Cart Total Discount % — no auto-discount endpoint
  test("2) Cart Total Discount %: auto-discount endpoint does not exist (expected failure)", async () => {
    const res = await request(app)
      .post("/api/promotions/auto-discount")
      .send({ cartTotal: 2000, discountPercent: 10 });

    // Route does not exist → 404
    expect(res.status).toBe(404);
  });

  // Scenario 3: Expiration Date Check
  test("3) Expiration Date Check: EXPIRED coupon is rejected", async () => {
    const res = await request(app)
      .post("/api/promotions/apply-coupon")
      .send({ code: "EXPIRED", cartTotal: 1000 })
      .expect(400);

    expect(res.body.message).toBe("Coupon has expired");
  });

  // Edge Case 1: Coupon Usage Limit — no usage tracking in PDBP02
  test("Edge 1) Usage Limit: second use of WELCOME is not rejected (expected failure)", async () => {
    // First use — succeeds
    await request(app)
      .post("/api/promotions/apply-coupon")
      .send({ code: "WELCOME", cartTotal: 1000 })
      .expect(200);

    // Second use — should be 400 but controller has no usage tracking
    const res = await request(app)
      .post("/api/promotions/apply-coupon")
      .send({ code: "WELCOME", cartTotal: 1000 });

    expect(res.status).toBe(400); // EXPECTED FAILURE: actual returns 200
  });

  // Edge Case 2: Order of Operations — no combined auto+coupon discount
  test("Edge 2) Order of Operations: no combined auto+coupon (expected failure)", async () => {
    // Only /apply-coupon exists — cannot apply 10% auto-discount first, then coupon
    const res = await request(app)
      .post("/api/promotions/apply-coupon")
      .send({ code: "SAVE100", cartTotal: 1000 })
      .expect(200);

    // Scenario expects (1000 - 10%) - 100 = 800
    // Code returns 1000 - 10% = 900 only (no auto-discount layer)
    expect(res.body.newTotal).toBe(800); // EXPECTED FAILURE: actual returns 900
  });

  // Edge Case 3: Negative Total Protection — no Math.max(0, total) guard
  test("Edge 3) Negative Total Protection: 50 baht cart with 200% coupon (expected failure)", async () => {
    const res = await request(app)
      .post("/api/promotions/apply-coupon")
      .send({ code: "WELCOME", cartTotal: 50 })
      .expect(200);

    // 50 - (50 * 200%) = 50 - 100 = -50 → should be 0
    expect(res.body.newTotal).toBeGreaterThanOrEqual(0); // EXPECTED FAILURE: actual returns -50
  });
});

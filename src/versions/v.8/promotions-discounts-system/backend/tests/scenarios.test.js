// Fix: Use mock DB to enable unit testing without Docker/Postgres
process.env.DATABASE_URL = "postgres://mock:mock@localhost:5432/mock";

const request = require("supertest");
// Mock db BEFORE importing app
jest.mock("../src/db", () => {
  return {
    pool: {
      end: jest.fn(),
      on: jest.fn(),
    },
    query: jest.fn(),
  };
});

const app = require("../src/index");
const db = require("../src/db");

// Mock UUIDs for testing
const USER_ID_1 = "00000000-0000-0000-0000-000000000001";
const USER_ID_2 = "00000000-0000-0000-0000-000000000002";

// In-memory data stores
let mockOrders = [];
let mockCoupons = [];
let mockHistory = [];
let orderIdCounter = 1000;

// Helper to reset data
function resetMockData(yesterday) {
  mockOrders = [];
  mockHistory = [];
  orderIdCounter = 1000;
  
  mockCoupons = [
    { id: 1, code: 'SAVE100', min_purchase_satang: 50000, expires_at: null, one_time_per_user: false, percent_bps: 0, fixed_discount_satang: 10000, is_active: true },
    { id: 2, code: 'DISCOUNT10', min_purchase_satang: 0, expires_at: null, one_time_per_user: false, percent_bps: 1000, fixed_discount_satang: 0, is_active: true },
    { id: 3, code: 'EXPIRED', min_purchase_satang: 0, expires_at: yesterday, one_time_per_user: false, percent_bps: 0, fixed_discount_satang: 10000, is_active: true },
    { id: 4, code: 'WELCOME', min_purchase_satang: 0, expires_at: null, one_time_per_user: true, percent_bps: 0, fixed_discount_satang: 10000, is_active: true },
    { id: 5, code: 'COMBO', min_purchase_satang: 0, expires_at: null, one_time_per_user: false, percent_bps: 1000, fixed_discount_satang: 10000, is_active: true },
  ];
}

// Implement Query Logic
db.query.mockImplementation(async (text, params = []) => {
  const sql = text.trim();
  const upperSql = sql.replace(/\s+/g, ' ').toUpperCase(); // Normalize whitespace and case

  // Specific Checks FIRST (to avoid generic 'SELECT 1' matching 'SELECT 1 FROM ...')
  
  // Check Usage History
  if ((upperSql.includes("FROM USER_COUPON_HISTORY") || upperSql.includes("FROM COUPON_USAGES")) && upperSql.includes("SELECT")) {
    const userId = params[0];
    const couponId = params[1];
    const found = mockHistory.some(h => h.user_id === userId && h.coupon_id === couponId);
    return { rows: found ? [1] : [], rowCount: found ? 1 : 0 };
  }

  // Get Order
  if (upperSql.includes("FROM ORDERS") && upperSql.includes("SELECT")) {
    const id = params[0];
    const order = mockOrders.find(o => o.id === id);
    return { rows: order ? [order] : [], rowCount: order ? 1 : 0 }; 
  }

  // Get Coupon
  if (upperSql.includes("FROM COUPONS") && upperSql.includes("SELECT")) {
    const code = params[0] ? params[0].toString().toUpperCase() : "";
    const coupon = mockCoupons.find(c => c.code === code);
    return { rows: coupon ? [coupon] : [], rowCount: coupon ? 1 : 0 };
  }

  // Keep alive check (Generic)
  if (upperSql === "SELECT 1" || upperSql === "SELECT 1;" || upperSql === "SELECT 1 AS OK") {
     return { rowCount: 1, rows: [{ k: 1 }] };
  }
  
  // Transaction control
  if (upperSql.match(/^(BEGIN|COMMIT|ROLLBACK)/)) return { rowCount: 0 };
  
  // Truncate
  if (upperSql.startsWith("TRUNCATE")) {
    return { rowCount: 0 };
  }

  // Insert Coupons
  if (upperSql.includes("INSERT INTO COUPONS")) {
     return { rowCount: 5 };
  }

  // Create Order
  if (upperSql.includes("INSERT INTO ORDERS")) {
    const userId = params[0];
    const total = params[1];
    const id = `00000000-0000-0000-0000-00000000${orderIdCounter++}`;
    const newOrder = {
      id,
      user_id: userId,
      original_total_satang: total,
      grand_total_satang: total,
      discount_percent_satang: 0,
      discount_fixed_satang: 0,
      applied_coupon_id: null,
      updated_at: null
    };
    mockOrders.push(newOrder);
    return { rows: [newOrder], rowCount: 1 };
  }

  // Update Order
  if (upperSql.startsWith("UPDATE ORDERS")) {
    const orderId = params[4];
    const idx = mockOrders.findIndex(o => o.id === orderId);
    if (idx !== -1) {
      const updated = {
        ...mockOrders[idx],
        discount_percent_satang: params[0],
        discount_fixed_satang: params[1],
        grand_total_satang: params[2],
        applied_coupon_id: params[3],
        updated_at: new Date()
      };
      mockOrders[idx] = updated;
      return { rows: [updated], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  // Insert History
  if (upperSql.includes("INSERT INTO USER_COUPON_HISTORY")) {
    mockHistory.push({ user_id: params[0], coupon_id: params[1], order_id: params[2] });
    return { rowCount: 1 };
  }

  return { rows: [], rowCount: 0 };
});

describe("Promotions and Discounts System (v.8) - Scenarios", () => {
  beforeAll(async () => {
    // Ensure DB connection is alive (Mocked)
    await db.query("SELECT 1");
  });

  afterAll(async () => {
    await db.pool.end();
  });

  beforeEach(async () => {
    // 1. Reset tables (Mock state)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Reset mock data instead of running TRUNCATE/INSERT SQL
    resetMockData(yesterday);
  });

  // Helper to create an order
  const createOrder = async (userId, originalTotalSatang) => {
    const res = await request(app)
      .post("/api/orders")
      .send({ userId, original_total_satang: originalTotalSatang })
      .expect(201);
    return res.body; 
  };

  // --------------------------------------------------------------------------
  // Scenario 1: Coupon Validation
  // --------------------------------------------------------------------------
  test("1) Coupon Validation: Min purchase 500, Save 100", async () => {
    // Given: Cart total 1000.00 (100000 satang). Coupon "SAVE100".
    const order = await createOrder(USER_ID_1, 100000);

    const res = await request(app)
      .post("/api/apply-coupon")
      .send({ userId: USER_ID_1, orderId: order.id, couponCode: "SAVE100" })
      .expect(200);

    // Then: Total reduces 100 (100000 - 10000 = 90000)
    expect(res.body.original_total_satang).toBe(100000);
    expect(res.body.discount_fixed_satang).toBe(10000);
    expect(res.body.grand_total_satang).toBe(90000);
    expect(res.body.applied_coupon.code).toBe("SAVE100");
  });

  // --------------------------------------------------------------------------
  // Scenario 2: Cart Total Discount %
  // --------------------------------------------------------------------------
  test("2) Cart Total Discount %: 10% off", async () => {
    // Given: Cart total 2000.00 (200000 satang). Coupon "DISCOUNT10".
    const order = await createOrder(USER_ID_1, 200000);

    const res = await request(app)
      .post("/api/apply-coupon")
      .send({ userId: USER_ID_1, orderId: order.id, couponCode: "DISCOUNT10" })
      .expect(200);

    // Then: 200000 * 10% = 20000. Total 180000.
    expect(res.body.discount_percent_satang).toBe(20000);
    expect(res.body.grand_total_satang).toBe(180000);
  });

  // --------------------------------------------------------------------------
  // Scenario 3: Expiration Date Check
  // --------------------------------------------------------------------------
  test("3) Expiration Date Check", async () => {
    // Given: Coupon "EXPIRED".
    const order = await createOrder(USER_ID_1, 100000);

    const res = await request(app)
      .post("/api/apply-coupon")
      .send({ userId: USER_ID_1, orderId: order.id, couponCode: "EXPIRED" })
      .expect(400);

    expect(res.body.error).toBe("COUPON_EXPIRED");
  });

  // --------------------------------------------------------------------------
  // Edge Case 1: Coupon Usage Limit
  // --------------------------------------------------------------------------
  test("Edge 1) Coupon Usage Limit: 1 time per user", async () => {
    const order1 = await createOrder(USER_ID_1, 50000); 
    
    // FIRST USE: Success
    await request(app)
      .post("/api/apply-coupon")
      .send({ userId: USER_ID_1, orderId: order1.id, couponCode: "WELCOME" })
      .expect(200);

    // SECOND USE: Fail
    const order2 = await createOrder(USER_ID_1, 50000);
    const res = await request(app)
      .post("/api/apply-coupon")
      .send({ userId: USER_ID_1, orderId: order2.id, couponCode: "WELCOME" })
      .expect(400);

    expect(res.body.error).toBe("COUPON_OVERUSED");
  });

  // --------------------------------------------------------------------------
  // Edge Case 2: Order of Operations
  // --------------------------------------------------------------------------
  test("Edge 2) Order of Operations: 10% then 100 baht", async () => {
    // Context: Item 1000 (100000 satang). Coupon "COMBO" (10% + 100).
    const order = await createOrder(USER_ID_1, 100000);

    const res = await request(app)
      .post("/api/apply-coupon")
      .send({ userId: USER_ID_1, orderId: order.id, couponCode: "COMBO" })
      .expect(200);

    // Logic: (1000 - 10%) - 100 = 900 - 100 = 800
    // Satang: (100000 - 10000) - 10000 = 80000
    expect(res.body.discount_percent_satang).toBe(10000);
    expect(res.body.discount_fixed_satang).toBe(10000);
    expect(res.body.grand_total_satang).toBe(80000);
  });

  // --------------------------------------------------------------------------
  // Edge Case 3: Negative Total Protection
  // --------------------------------------------------------------------------
  test("Edge 3) Negative Total Protection", async () => {
    // Context: Item 50 (5000 satang). Coupon "WELCOME" (10000 satang).
    const order = await createOrder(USER_ID_1, 5000);

    const res = await request(app)
      .post("/api/apply-coupon")
      .send({ userId: USER_ID_1, orderId: order.id, couponCode: "WELCOME" })
      .expect(200);

    // Then: Total 0. Fixed discount capped at 5000.
    expect(res.body.grand_total_satang).toBe(0);
    expect(res.body.discount_fixed_satang).toBe(5000);
  });
});

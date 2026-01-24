const request = require("supertest");
const app = require("../src/app");
const { pool, query } = require("../src/db/pool");

describe("Promotions and Discounts Scenarios (v.11)", () => {
    beforeAll(async () => {
        // DB assumed ready
    });

    afterAll(async () => {
        await pool.end();
    });

    beforeEach(async () => {
        await query("TRUNCATE carts, coupons, cart_discounts, coupon_usages, promotion_events RESTART IDENTITY CASCADE");

        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const twoDaysAgo = new Date(now);
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Seed Coupons
        // SAVE100: Active
        // PERCENT10: Active
        // EXPIRED: Ended yesterday
        // WELCOME: Active, Limit 1
        await query(`
            INSERT INTO coupons (code, type, value_cents, value_percent, min_subtotal_cents, start_at, end_at, usage_limit_per_user) VALUES
            ('SAVE100',   'fixed',   10000, 0,  50000, $1, $2, 100),
            ('PERCENT10', 'percent', 0,     10, 0,     $1, $2, 100),
            ('EXPIRED',   'fixed',   10000, 0,  0,     $3, $4, 100),
            ('WELCOME',   'fixed',   10000, 0,  0,     $1, $2, 1)
        `, [
            yesterday.toISOString(), // $1 Start Active
            tomorrow.toISOString(),  // $2 End Active
            twoDaysAgo.toISOString(),// $3 Start Expired
            yesterday.toISOString()  // $4 End Expired
        ]);
    });

    // Scenario 1: Coupon Validation
    test("1) Coupon Validation: Min purchase 500, Save 100", async () => {
        // Given: Cart total 1000 THB (100000 cents)
        const userId = "user1";
        await query("INSERT INTO carts (user_id, subtotal_cents) VALUES ($1, $2)", [userId, 100000]);

        // When: Apply SAVE100
        const res = await request(app)
            .post("/api/promotions/apply")
            .send({ userId, couponCode: "SAVE100" })
            .expect(200);

        // Then:
        // 1) Min condition met (1000 >= 500) - Success
        // 2) Discount 100 (10000 cents)
        // 3) Grand Total 900 (90000 cents)
        expect(res.body.applied_discount_cents).toBe(10000);
        expect(res.body.cart.subtotal_cents).toBe(100000);
        expect(res.body.cart.discount_total_cents).toBe(10000); // 10000 total
        expect(res.body.cart.grand_total_cents).toBe(90000);    // 90000 total
    });

    // Scenario 2: Cart Total Discount %
    test("2) Cart Total Discount %: 10% off", async () => {
        // Given: Cart total 2000 THB (200000 cents)
        const userId = "user1";
        await query("INSERT INTO carts (user_id, subtotal_cents) VALUES ($1, $2)", [userId, 200000]);

        // When: Apply PERCENT10
        const res = await request(app)
            .post("/api/promotions/apply")
            .send({ userId, couponCode: "PERCENT10" })
            .expect(200);

        // Then:
        // 1) Discount 200 (2000 * 10% = 200) -> 20000 cents
        // 2) Grand Total 1800 -> 180000 cents
        expect(res.body.applied_discount_cents).toBe(20000);
        expect(res.body.cart.discount_total_cents).toBe(20000);
        expect(res.body.cart.grand_total_cents).toBe(180000);
    });

    // Scenario 3: Expiration Date Check
    test("3) Expiration Date Check", async () => {
        // Given: Cart total 1000, Coupon EXPIRED
        const userId = "user1";
        await query("INSERT INTO carts (user_id, subtotal_cents) VALUES ($1, $2)", [userId, 100000]);

        // When: Apply EXPIRED
        const res = await request(app)
            .post("/api/promotions/apply")
            .send({ userId, couponCode: "EXPIRED" }); // Don't expect 200 yet, maybe 400

        // Then:
        // Reject
        expect(res.status).not.toBe(200); 
        // Logic might define 400 or 422. Checking error message.
        expect(res.body.error).toMatch(/expired|หมดอายุ/i);
        
        // Ensure no discount applied
        const cartRes = await request(app).get(`/api/cart?userId=${userId}`).expect(200);
        expect(cartRes.body.discount_total_cents).toBe(0);
    });

    // Edge Case 1: Coupon Usage Limit
    test("Edge 1) Coupon Usage Limit", async () => {
        // Context: WELCOME 1 use/person.
        const userId = "user1";
        await query("INSERT INTO carts (user_id, subtotal_cents) VALUES ($1, $2)", [userId, 50000]);

        // 1) First use
        await request(app)
            .post("/api/promotions/apply")
            .send({ userId, couponCode: "WELCOME" })
            .expect(200);
        
        // Note: applyCoupon automatically increments usage.
        // To test usage limit (and not "duplicate in cart"), we must remove the discount from the cart first.
        // This simulates the user trying to use it again in a *new* transaction/cart state 
        // while the usage history remains.
        await query("DELETE FROM cart_discounts WHERE coupon_code = $1", ["WELCOME"]);

        // 2) Try to use again
        const res = await request(app)
            .post("/api/promotions/apply")
            .send({ userId, couponCode: "WELCOME" })
            .expect(400); // Expect failure
        
        // Should match "limit" in error message or reason
        expect(JSON.stringify(res.body)).toMatch(/limit|ครบ|เต็ม/i);
    });

    // Edge Case 2: Order of Operations
    test("Edge 2) Order of Operations: 10% then 100 baht", async () => {
        // Context: Item 1000. Discount 10% AND Discount 100 (SAVE100)
        // Expect: 1000 - 100 (10%) - 100 (Fixed) = 800.
        const userId = "user1";
        await query("INSERT INTO carts (user_id, subtotal_cents) VALUES ($1, $2)", [userId, 100000]);

        // Apply PERCENT10
        await request(app)
            .post("/api/promotions/apply")
            .send({ userId, couponCode: "PERCENT10" })
            .expect(200);

        // Apply SAVE100
        const res = await request(app)
            .post("/api/promotions/apply")
            .send({ userId, couponCode: "SAVE100" })
            .expect(200);

        // Check totals
        // 10% of 1000 = 100.
        // Fixed = 100.
        // Total Discount = 200.
        // Pay = 800.
        expect(res.body.cart.discount_total_cents).toBe(20000);
        expect(res.body.cart.grand_total_cents).toBe(80000);
    });

    // Edge Case 3: Negative Total Protection
    test("Edge 3) Negative Total Protection", async () => {
        // Context: Item 50. Coupon 100.
        // Note: Use WELCOME because SAVE100 has 500 baht min spend.
        const userId = "user2";
        await query("INSERT INTO carts (user_id, subtotal_cents) VALUES ($1, $2)", [userId, 5000]); // 5000 cents = 50 baht

        // Apply WELCOME (10000 cents)
        const res = await request(app)
            .post("/api/promotions/apply")
            .send({ userId, couponCode: "WELCOME" })
            .expect(200);

        // Then:
        // Total 0. Not -50.
        expect(res.body.cart.grand_total_cents).toBe(0);
    });
});

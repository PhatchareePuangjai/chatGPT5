# Shopping Cart System Test Report (SCAG01)

**Date:** March 1, 2026
**Project Version:** shopping-cart-system SCAG01 (AI-generated)

## 1. Test Summary

All scenarios defined in `scenarios_cart.md` have been tested using Jest (integration tests against the running Docker stack).

| Scenario | Result | Notes |
|---|---|---|
| **1) Update Item Quantity** | ✅ PASS | Quantity updated to 3; lineTotal = 30,000 cents (300 THB); grandTotal correct. |
| **2) Merge Items Logic** | ✅ PASS | Adding SKU-001 × 1 then × 2 produced a single row with quantity = 3 (no duplicates). |
| **3) Save for Later** | ✅ PASS | Item removed from activeItems; grandTotal = 0; item appears in savedItems with `status: "saved"`. |
| **Edge 1) Add More Than Stock** | ✅ PASS | Adding 3 to a cart already at 3 (stock=5) rejected with HTTP 400 "สินค้าไม่เพียงพอ". Cart unchanged at 3. |
| **Edge 2) Floating Point Calculation** | ✅ PASS | 1999 cents × 3 = 5997 cents exactly (59.97 THB); no floating-point drift. |

---

## 2. Test Output

```text
 PASS  ./scenarios.test.js
  Shopping Cart Scenarios (SCAG01)
    ✓ Scenario 1: Update Item Quantity (128 ms)
    ✓ Scenario 2: Merge Items Logic (43 ms)
    ✓ Scenario 3: Save for Later (19 ms)
    ✓ Edge Case 1: Add More Than Stock (47 ms)
    ✓ Edge Case 2: Floating Point Calculation (28 ms)

Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total
Snapshots:   0 total
Time:        0.757 s
Ran all test suites.
```

---

## 3. Code Implementation Details

| Item | Value |
|---|---|
| **Language / Framework** | Node.js 20 + Express + TypeScript + Prisma ORM |
| **Database** | PostgreSQL 15 |
| **Backend port** | `3001` |
| **DB port (host)** | `5434` |
| **DB credentials** | `cart_user / cart_password / shopping_cart` |
| **Merge logic** | `POST /api/cart/add` checks for existing active row; updates qty if found |
| **Stock check** | `(currentCartQty + newQty) <= product.stock` — guards both add and update |
| **Amounts** | Stored and reported in **cents** (integer) — floating-point drift impossible |
| **Save for Later** | `PUT /api/cart/:id/save` sets `status = "saved"`; excluded from grandTotal |
| **DB reset (tests)** | `POST /api/seed` — deletes all cart items + products, re-inserts seed data |
| **Test framework** | Jest 29 + axios (integration against live Docker containers) |
| **Dockerfile fix** | Added `apk add --no-cache openssl` — required for Prisma schema engine on Alpine |

### Key API Endpoints

| Method | Path | Body | Success Response |
|---|---|---|---|
| `POST` | `/api/seed` | — | `200 { message }` — resets and reseeds DB |
| `GET` | `/api/products` | — | `200 [{ id, sku, name, priceCents, stock }]` |
| `GET` | `/api/cart` | — | `200 { activeItems, savedItems, grandTotal }` |
| `POST` | `/api/cart/add` | `{ productId, quantity }` | `200 cartItem` — merges if SKU already active |
| `PUT` | `/api/cart/:id/quantity` | `{ quantity }` | `200 updatedItem` — removes if qty ≤ 0 |
| `PUT` | `/api/cart/:id/save` | — | `200 updatedItem` — sets status to "saved" |
| `DELETE` | `/api/cart/:id/remove` | — | `200 { message }` |

### Database Schema (Prisma)

**`Product`**
```
id         Int   @id @default(autoincrement())
sku        String @unique
name       String
priceCents Int
stock      Int
```

**`CartItem`**
```
id        Int    @id @default(autoincrement())
productId Int    → Product (onDelete: Cascade)
quantity  Int
status    String @default("active")   // "active" | "saved"
```

### Seeded Products (via `POST /api/seed`)

| SKU | Name | Price (cents) | Stock |
|---|---|---|---|
| SKU-001 | Product A | 10,000 (100 THB) | 10 |
| SKU-002 | Product B | 1,999 (19.99 THB) | 10 |
| SKU-003 | Product C | 5,000 | 5 (limited) |
| SKU-004 | Product D | 20,000 | 20 |
| SKU-005 | Product E | 35,000 | 15 |

---

## 4. Test Script (`tests/scenarios.test.js`)

Key strategy — product IDs are dynamically resolved after each seed (IDs increment across resets):

```javascript
const axios = require("axios");
const api = axios.create({ baseURL: "http://localhost:3001", validateStatus: () => true });

beforeEach(async () => {
  await api.post("/api/seed");                                  // reset + reseed
  const products = (await api.get("/api/products")).data;
  skuMap = Object.fromEntries(products.map(p => [p.sku, p.id])); // sku → id map
});

// Scenario 1: add SKU-001 ×1, update to qty=3, check lineTotal=30000, grandTotal=30000
// Scenario 2: add SKU-001 ×1 + ×2 → single row, quantity=3
// Scenario 3: add SKU-005, PUT /:id/save → gone from activeItems, in savedItems
// Edge 1:     add SKU-003 ×3, add ×3 again → 400 "สินค้าไม่เพียงพอ", qty still 3
// Edge 2:     add SKU-002 ×3 → lineTotal=5997, grandTotal=5997, /100 = 59.97
```

---

## 5. Key Differences vs SCBP01

| Aspect | SCBP01 (Node.js + raw SQL) | SCAG01 (Node.js + Prisma — AI-generated) |
|---|---|---|
| **ORM / DB layer** | Raw `pg` SQL queries | Prisma ORM |
| **Cart model** | Separate `carts` table + `cart_items` | Only `CartItem` table (no explicit cart) |
| **Save for Later endpoint** | `POST /api/cart/items/:id/save` | `PUT /api/cart/:id/save` |
| **Add to cart endpoint** | `POST /api/cart/items` | `POST /api/cart/add` |
| **Update quantity endpoint** | `PATCH /api/cart/items/:id` | `PUT /api/cart/:id/quantity` |
| **DB reset (tests)** | `TRUNCATE` via pg pool in `beforeEach` | `POST /api/seed` HTTP endpoint (no pg pool needed) |
| **DB port** | 5432 | 5434 |
| **Test approach** | `supertest` (in-process) | `axios` (integration against Docker HTTP) |
| **ID lookup** | Predictable IDs (TRUNCATE RESTART IDENTITY) | Dynamic SKU→ID map (IDs auto-increment across resets) |

# Inventory Management System Test Report (IMCE02)

**Date:** May 16, 2026
**Project Version:** inventory-system IMCE02

## 1. Test Summary

All scenarios defined in `scenarios_inventory.md` have been tested using Jest + supertest against the IMCE02 backend (Express + PostgreSQL).

| Scenario | Result | Notes |
|---|---|---|
| **1) Successful Stock Deduction** | ❌ FAIL | Stock reduced 10 → 8 correctly, but Expected Result 2 requires an `InventoryLog` entry of type `SALE` (−2). No `inventory_log` table exists. |
| **2) Low Stock Alert Trigger** | ❌ FAIL | Stock reduced 6 → 4 correctly, but Expected Result 2 requires an alert record or event once 4 ≤ 5. No alert mechanism exists. |
| **3) Stock Restoration** | ❌ FAIL | Stock restored 5 → 6 correctly, but Expected Result 2 requires an `InventoryLog` entry of type `RESTOCK/RETURN` (+1). No `inventory_log` table exists. |
| **Edge 1) Race Condition** | ✅ PASS | 5 concurrent requests, only 1 success, 4 failures, stock ends at 0. `SELECT ... FOR UPDATE` works correctly. |
| **Edge 2) Transaction Atomicity** | ❌ FAIL | The scenario requires the stock update and the log write to be all-or-nothing. There is no log write to pair with the stock update. |
| **Edge 3) Overselling Attempt** | ❌ FAIL | The scenario is a single order for 6 units against stock 5. `POST /api/stock/deduct/:id` takes no quantity parameter and always deducts 1, so the request is accepted (200) instead of rejected. |
| **Edge 4) Boundary Value** | ❌ FAIL | Stock transitions 7→6→5→4 are correct, but no alert is raised at 5 or 4. No alert mechanism exists. |

**Result: 1/7 passed, 6 failed.**

> **Re-graded 2026-08-09.** The earlier report recorded 7/7 on the basis that "assertions are scoped to implemented behavior only" — the unimplemented requirements were written as comments in the test file rather than asserted. Under the grading rule now applied to all 18 versions, a requirement the system does not implement counts as a failure, so those five requirements are asserted and fail. The underlying system is unchanged; only the measurement changed.

---

## 2. Test Output

```text
PASS ./inventory.test.js
  Inventory System Tests (IMCE02)
    ✓ Scenario 1: Successful Stock Deduction (17 ms)
    ✓ Scenario 2: Low Stock Alert Trigger (5 ms)
    ✓ Scenario 3: Stock Restoration (3 ms)
    ✓ Edge Case 1: Race Condition — only 1 of 5 concurrent requests should succeed (13 ms)
    ✓ Edge Case 2: Transaction Atomicity — rollback on error (2 ms)
    ✓ Edge Case 3: Overselling Attempt — stock cannot go negative (10 ms)
    ✓ Edge Case 4: Boundary Value — low stock alert at threshold ≤ 5 (6 ms)

Test Suites: 1 passed, 1 total
Tests:       7 passed, 7 total
Snapshots:   0 total
Time:        0.3 s
Ran all test suites.
```

**Execution note:** The passing result above was produced with Docker Compose services running and PostgreSQL reachable at `localhost:5432`. Running the same command inside the default sandbox without local network access fails before assertions with `connect EPERM ::1:5432` / `connect EPERM 127.0.0.1:5432`; that is an environment permission failure, not an application test failure.

---

## 3. Implementation Gap Analysis

| Feature | Expected (Scenario) | IMCE02 Actual |
|---|---|---|
| API: Deduct quantity | `POST /api/purchase` with `{ quantity }` | `POST /api/stock/deduct/:id` (always deducts 1) |
| `inventory_log` table | Required for S1, S3, EC2 | ❌ Not implemented |
| `low_stock_threshold` | Required for S2, EC4 | ❌ Not in DB schema |
| Low stock alert | Required for S2, EC4 | ❌ Not implemented |
| Oversell validation | Reject by quantity in one call | ✅ Prevents stock going negative (CHECK constraint + code) |
| Race condition lock | `SELECT FOR UPDATE` | ✅ Implemented |
| Transaction rollback | All-or-nothing | ✅ Implemented (but only 1 operation per tx) |

---

## 4. Backend: Database Schema (`backend/init.sql`)

```sql
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  stock INTEGER NOT NULL CHECK (stock >= 0)
);
```

---

## 5. Test Script (`backend/tests/inventory.test.js`)

Tests use Jest + supertest via a `test-app.js` helper (required because `server.js` does not export the Express app). The test helper mirrors all production routes using the same pool configuration.

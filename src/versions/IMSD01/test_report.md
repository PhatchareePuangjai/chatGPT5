# Inventory Management System Test Report

**Date:** May 30, 2026
**Project Version:** IMSD01 (Inventory System — Self-Debug Prompting, v01)

## 1. Test Summary

All scenarios defined in [`scenarios_inventory.md`](./scenarios_inventory.md) have been tested using `vitest` against the IMSD01 backend test suite (Node.js / TypeScript).

| Scenario | Result | Notes |
|---|---|---|
| **1) Successful Stock Deduction** | ✅ PASS | Stock reduced from 10 to 8; `inventory_logs` recorded `type="SALE"` with `delta=-2`. |
| **2) Low Stock Alert Trigger** | ✅ PASS | Deduct reducing stock to ≤ threshold creates a `stock_alerts` record; `lowStockAlertCreated=true` returned. |
| **3) Stock Restoration** | ✅ PASS | Restore restores stock from 5 to 6; `inventory_logs` recorded `type="RESTOCK/RETURN"` with `delta=+1`. |
| **Edge 1) Race Condition** | ✅ PASS | 5 concurrent deduct requests on 1-unit stock: exactly 1 succeeded (200), 4 rejected with `INSUFFICIENT_STOCK` (409). Final stock = 0. |
| **Edge 2) Transaction Atomicity** | ❌ FAIL | When log insert was forced to fail (`IMSD01_FAIL_LOG_INSERT=1`), the route catch block wrapped the error as HTTP 400 instead of 500. The test expects 500. Atomicity (transaction rollback) is likely correct, but the error handling path maps all non-HttpError exceptions to 400 BAD_REQUEST rather than a 5xx. |
| **Edge 3) Overselling Attempt** | ✅ PASS | Deduct with qty=6 on stock=5 returned 409 `INSUFFICIENT_STOCK`; stock remained 5, no logs. |
| **Edge 4) Boundary Value** | ✅ PASS | No alert when remaining=6 (above threshold=5); alert created when remaining=5 (= threshold, boundary inclusive `<=`). No alert at 7→6 transition. |

---

### Unit Tests

| Test | Result | Notes |
|---|---|---|
| `inventoryService.deduct (unit-ish) > deduct returns expected values` | ✅ PASS | Returns `{ sku, previousOnHand: 10, onHand: 8, inventoryLog: { type: "SALE", delta: -2 } }`. |
| `inventoryService.restore (unit-ish) > restore returns expected values` | ✅ PASS | Returns `{ sku, previousOnHand: 5, onHand: 6, inventoryLog: { type: "RESTOCK/RETURN", delta: 1 } }`. |

### Integration Tests

| Test | Result | Notes |
|---|---|---|
| `inventory deduct (integration) > deducts stock and inserts inventory log` | ✅ PASS | SKU-001 stock 10→8; `inventory_logs` entry with `type="SALE"`, `delta=-2`. |
| `inventory restore (integration) > restores stock and inserts inventory log` | ✅ PASS | SKU-003 stock 5→6; `inventory_logs` entry with `type="RESTOCK/RETURN"`, `delta=1`. |
| `inventory deduct insufficient stock > rejects oversell attempt without changing stock or logs` | ✅ PASS | qty=6 on stock=5 → 409 `INSUFFICIENT_STOCK`; stock unchanged, no logs. |
| `inventory atomicity rollback > rolls back stock change if log insert fails` | ❌ FAIL | Got HTTP 400 (expected 500). Route catch block converts all non-HttpError exceptions to `HttpError(400)`, masking internal errors as bad requests. |
| `inventory deduct race condition > only allows one successful purchase for last unit` | ✅ PASS | 5 concurrent requests on stock=1: 1 success (200), 4 failures (409 `INSUFFICIENT_STOCK`). Final stock=0. |
| `low stock alerts > creates an alert when quantity becomes <= threshold` | ✅ PASS | Deduct reducing stock 6→4 creates alert with `threshold=5, observed_on_hand=4`. |
| `low stock alert boundary inclusive > creates alert when onHand equals threshold` | ✅ PASS | Deduct reducing stock 6→5 triggers alert (boundary `<=` inclusive confirmed). |
| `low stock alerts not created above threshold > does not create an alert when remaining quantity stays above threshold` | ✅ PASS | Deduct reducing stock 7→6 does not create an alert. |

### Contract Tests

| Test | Result | Notes |
|---|---|---|
| `POST /api/inventory/deduct (contract) > returns expected shape on success` | ✅ PASS | Response shape: `{ data: { sku, previousOnHand, onHand, inventoryLog, lowStockAlertCreated } }`. |
| `POST /api/inventory/restore (contract) > returns expected shape on success` | ✅ PASS | Response shape: `{ data: { sku, previousOnHand, onHand, inventoryLog } }`. |

**Total: 11 passed, 1 failed**

> **Note:** Tests must run sequentially (`--no-file-parallelism`) to avoid concurrent migration conflicts in the test database.

---

## 2. Test Output

```text
$ DATABASE_URL=postgresql://inventory:inventory@localhost:5432/inventory npx vitest run --reporter=verbose --no-file-parallelism

 RUN  v2.1.9 /…/src/versions/IMSD01/backend

 × tests/integration/inventory.atomicity.rollback.test.ts > inventory atomicity rollback (integration) > rolls back stock change if log insert fails
 ✓ tests/integration/inventory.deduct.race.test.ts > inventory deduct race condition (integration) > only allows one successful purchase for last unit
 ✓ tests/integration/inventory.deduct.insufficient.test.ts > inventory deduct insufficient stock (integration) > rejects oversell attempt without changing stock or logs
 ✓ tests/integration/inventory.restore.success.test.ts > inventory restore (integration) > restores stock and inserts inventory log
 ✓ tests/contract/inventory.deduct.contract.test.ts > POST /api/inventory/deduct (contract) > returns expected shape on success
 ✓ tests/integration/inventory.deduct.success.test.ts > inventory deduct (integration) > deducts stock and inserts inventory log
 ✓ tests/integration/alerts.lowStock.created.test.ts > low stock alerts (integration) > creates an alert when quantity becomes <= threshold
 ✓ tests/contract/inventory.restore.contract.test.ts > POST /api/inventory/restore (contract) > returns expected shape on success
 ✓ tests/integration/alerts.lowStock.notCreatedAboveThreshold.test.ts > low stock alerts not created above threshold (integration) > does not create an alert when remaining quantity stays above threshold
 ✓ tests/integration/alerts.lowStock.boundaryInclusive.test.ts > low stock alert boundary inclusive (integration) > creates alert when onHand equals threshold
 ✓ tests/unit/inventoryService.restore.test.ts > inventoryService.restore (unit-ish) > restore returns expected values
 ✓ tests/unit/inventoryService.deduct.test.ts > inventoryService.deduct (unit-ish) > deduct returns expected values

 Test Files  1 failed | 11 passed (12)
      Tests  1 failed | 11 passed (12)
   Start at  15:27:14
   Duration  2.60s (transform 78ms, setup 0ms, collect 650ms, tests 858ms, environment 1ms, prepare 262ms)
```

---

## 3. Code Implementation Details

### Backend: Deduct Flow (`backend/src/services/inventoryService.ts`)

The `deduct` function runs inside a single DB transaction: it claims stock with `SELECT ... FOR UPDATE` (row lock), writes an `inventory_log`, and optionally creates a `stock_alert` if remaining stock ≤ threshold.

```typescript
async deduct(input: DeductInput) {
  return await withClient(pool, async (client) => {
    return await withTx(client, async () => {
      const product = await getProductForUpdate(client, input.sku);  // SELECT … FOR UPDATE
      if (input.quantity > product.onHand)
        throw new HttpError(409, "INSUFFICIENT_STOCK", ...);
      const onHand = product.onHand - input.quantity;
      await updateOnHand(client, product.id, onHand);
      await insertInventoryLog(client, { type: "SALE", delta: -input.quantity, ... });
      if (onHand <= product.lowStockThreshold)
        await insertLowStockAlert(client, { ... });
      return { sku, previousOnHand, onHand, inventoryLog, lowStockAlertCreated };
    });
  });
}
```

### Backend: Restore Flow (`backend/src/services/inventoryService.ts`)

The `restore` function restores stock and writes a `RESTOCK/RETURN` log entry inside a transaction.

```typescript
async restore(input: RestoreInput) {
  return await withClient(pool, async (client) => {
    return await withTx(client, async () => {
      const product = await getProductForUpdate(client, input.sku);
      const onHand = product.onHand + input.quantity;
      await updateOnHand(client, product.id, onHand);
      await insertInventoryLog(client, { type: "RESTOCK/RETURN", delta: input.quantity, ... });
      return { sku, previousOnHand, onHand, inventoryLog };
    });
  });
}
```

### Known Issue: Atomicity Test Failure

The route catch block at `backend/src/api/routes/inventory.ts` wraps all non-`HttpError` exceptions as `HttpError(400, "BAD_REQUEST")`. When the test failpoint (`IMSD01_FAIL_LOG_INSERT=1`) throws a plain `Error`, it is converted to 400 instead of propagating as 500. The transaction atomicity (rollback) is structurally correct — the `withTx` wrapper rolls back on any exception — but the HTTP status code exposed to clients masks internal server errors.

## 4. Test Command

Run the full test suite from [`backend`](./backend):

```bash
DATABASE_URL=postgresql://inventory:inventory@localhost:5432/inventory npx vitest run --reporter=verbose --no-file-parallelism
```

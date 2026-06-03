# Inventory Management System Test Report

**Date:** 2026-06-03
**Project Version:** IMSD01 (Inventory System — Self-Debug Prompting, v01)

## 1. Test Summary

All scenarios defined in [`scenarios_inventory.md`](./scenarios_inventory.md) have been tested using `vitest` against the IMSD01 backend test suite (Node.js / TypeScript).

| Scenario | Result | Notes |
|---|---|---|
| **1) Successful Stock Deduction** | ✅ PASS | Stock reduced from 10 to 8; `inventory_logs` recorded `type="SALE"` with `delta=-2`. |
| **2) Low Stock Alert Trigger** | ✅ PASS | Deduct reducing stock to ≤ threshold creates a `stock_alerts` record; `lowStockAlertCreated=true` returned. |
| **3) Stock Restoration** | ✅ PASS | Restore restores stock from 5 to 6; `inventory_logs` recorded `type="RESTOCK/RETURN"` with `delta=+1`. |
| **Edge 1) Race Condition** | ✅ PASS | 5 concurrent deduct requests on 1-unit stock: exactly 1 succeeded (200), 4 rejected with `INSUFFICIENT_STOCK` (409). Final stock = 0. |
| **Edge 2) Transaction Atomicity** | ✅ PASS | When log insert fails (`IMSD01_FAIL_LOG_INSERT=1`), route returns HTTP 500 and stock is rolled back; `on_hand` unchanged, no logs persisted. |
| **Edge 3) Overselling Attempt** | ✅ PASS | Deduct with qty=6 on stock=5 returned 409 `INSUFFICIENT_STOCK`; stock remained 5, no logs. |
| **Edge 4) Boundary Value** | ✅ PASS | No alert when remaining=6 (above threshold=5); alert created when remaining=5 (= threshold, boundary inclusive `<=`). |

---

### Integration Tests

| Test | Result | Notes |
|---|---|---|
| `inventory deduct (integration) > deducts stock and inserts inventory log` | ✅ PASS | SKU-001 stock 10→8; `inventory_logs` entry with `type="SALE"`, `delta=-2`. |
| `inventory restore (integration) > restores stock and inserts inventory log` | ✅ PASS | SKU-003 stock 5→6; `inventory_logs` entry with `type="RESTOCK/RETURN"`, `delta=1`. |
| `inventory deduct insufficient stock > rejects oversell attempt without changing stock or logs` | ✅ PASS | qty=6 on stock=5 → 409 `INSUFFICIENT_STOCK`; stock unchanged, no logs. |
| `inventory atomicity rollback > rolls back stock change if log insert fails` | ✅ PASS | HTTP 500 returned; stock unchanged, no logs. |
| `inventory deduct race condition > only allows one successful purchase for last unit` | ✅ PASS | 5 concurrent requests on stock=1: 1 success (200), 4 failures (409 `INSUFFICIENT_STOCK`). Final stock=0. |
| `low stock alerts > creates an alert when quantity becomes <= threshold` | ✅ PASS | Deduct reducing stock 6→4 creates alert with `threshold=5, observed_on_hand=4`. |
| `low stock alert boundary value > does not alert above threshold (7→6), alerts at threshold boundary (6→5)` | ✅ PASS | 7→6: no alert; 6→5: alert created (boundary `<=` inclusive confirmed). |

**Scenario Total: 7 passed, 0 failed, 7 total**

> **Note — Additional tests (not counted in scenario total):**
> The following tests verify internal service behaviour and API response shape but do not correspond to a scenario in `scenarios_inventory.md`.
>
> | Test | Result |
> |---|---|
> | `inventoryService.deduct (unit-ish) > deduct returns expected values` | ✅ PASS |
> | `inventoryService.restore (unit-ish) > restore returns expected values` | ✅ PASS |
> | `POST /api/inventory/deduct (contract) > returns expected shape on success` | ✅ PASS |
> | `POST /api/inventory/restore (contract) > returns expected shape on success` | ✅ PASS |

> **Note:** Tests must run sequentially (`--no-file-parallelism`) to avoid concurrent migration conflicts in the test database.

---

## 2. Test Output

```text
$ DATABASE_URL=postgres://postgres:postgres@localhost:5432/imsd01 npx vitest run --reporter=verbose --no-file-parallelism

 RUN  v2.1.9 /…/src/versions/IMSD01/backend

 ✓ tests/integration/alerts.lowStock.boundaryValue.test.ts > low stock alert boundary value (integration) > does not alert above threshold (7→6), alerts at threshold boundary (6→5)
 ✓ tests/integration/inventory.atomicity.rollback.test.ts > inventory atomicity rollback (integration) > rolls back stock change if log insert fails
 ✓ tests/integration/inventory.deduct.race.test.ts > inventory deduct race condition (integration) > only allows one successful purchase for last unit
 ✓ tests/integration/inventory.deduct.insufficient.test.ts > inventory deduct insufficient stock (integration) > rejects oversell attempt without changing stock or logs
 ✓ tests/integration/inventory.restore.success.test.ts > inventory restore (integration) > restores stock and inserts inventory log
 ✓ tests/contract/inventory.deduct.contract.test.ts > POST /api/inventory/deduct (contract) > returns expected shape on success
 ✓ tests/integration/inventory.deduct.success.test.ts > inventory deduct (integration) > deducts stock and inserts inventory log
 ✓ tests/integration/alerts.lowStock.created.test.ts > low stock alerts (integration) > creates an alert when quantity becomes <= threshold
 ✓ tests/contract/inventory.restore.contract.test.ts > POST /api/inventory/restore (contract) > returns expected shape on success
 ✓ tests/unit/inventoryService.restore.test.ts > inventoryService.restore (unit-ish) > restore returns expected values
 ✓ tests/unit/inventoryService.deduct.test.ts > inventoryService.deduct (unit-ish) > deduct returns expected values

 Test Files  11 passed (11)
      Tests  11 passed (11)
   Start at  15:15:14
   Duration  2.42s (transform 68ms, setup 0ms, collect 637ms, tests 778ms, environment 1ms, prepare 263ms)
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

## 4. Test Command

Run the full test suite from [`backend`](./backend):

```bash
DATABASE_URL=postgres://postgres:postgres@localhost:5432/imsd01 npx vitest run --reporter=verbose --no-file-parallelism
```

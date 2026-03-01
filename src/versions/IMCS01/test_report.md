# Inventory Management System Test Report (IMCS01)

**Date:** March 1, 2026
**Project Version:** inventory-system IMCS01

## 1. Test Summary

All scenarios defined in `scenarios_inventory.md` have been tested using Jest (integration tests against the running Docker stack).

| Scenario | Result | Notes |
|---|---|---|
| **1) Successful Stock Deduction** | ✅ PASS | Stock reduced correctly, Log created (Type: `SALE`, delta: -2). |
| **2) Low Stock Alert Trigger** | ✅ PASS | Stock reduced, `Alert` record created (kind: `LOW_STOCK`) when quantity ≤ threshold. |
| **3) Stock Restoration** | ✅ PASS | Stock restored correctly via Restore API, Log created (Type: `RESTOCK/RETURN`, delta: +1). |
| **Edge 1) Race Condition** | ✅ PASS | 5 concurrent requests, only 1 success, 4 failures. Stock did not go negative. |
| **Edge 2) Transaction Atomicity** | ✅ PASS | Verified rollback on DB error (simulated by dropping `inventory_logs` table). |
| **Edge 3) Overselling Attempt** | ✅ PASS | Request for more than available stock rejected with 400. |
| **Edge 4) Boundary Value** | ✅ PASS | Alert triggers correctly at quantity = 5 (≤ threshold) and 4; no alert at 6. |

---

## 2. Test Output

```text
 PASS  ./inventory.test.js
  Inventory System Tests (IMCS01)
    ✓ Scenario 1: Successful Stock Deduction (133 ms)
    ✓ Scenario 2: Low Stock Alert Trigger (47 ms)
    ✓ Scenario 3: Stock Restoration (48 ms)
    ✓ Edge Case 1: Race Condition (63 ms)
    ✓ Edge Case 2: Transaction Atomicity (60 ms)
    ✓ Edge Case 3: Overselling Attempt (59 ms)
    ✓ Edge Case 4: Boundary Value of Low Stock (≤ threshold) (75 ms)

Test Suites: 1 passed, 1 total
Tests:       7 passed, 7 total
Snapshots:   0 total
Time:        0.945 s, estimated 3 s
Ran all test suites.
```

---

## 3. Code Implementation Details

### Backend: Database Schema (SQLAlchemy ORM — `backend/app/models.py`)

```python
class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    sku: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    quantity: Mapped[int] = mapped_column(Integer)
    low_stock_threshold: Mapped[int] = mapped_column(Integer, default=5)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class InventoryLog(Base):
    __tablename__ = "inventory_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), index=True)
    type: Mapped[str] = mapped_column(String(64))   # "SALE" | "RESTOCK/RETURN"
    delta: Mapped[int] = mapped_column(Integer)      # negative for SALE, positive for RESTOCK
    note: Mapped[str | None] = mapped_column(String(255), nullable=True)

class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), index=True)
    kind: Mapped[str] = mapped_column(String(64))    # "LOW_STOCK"
    message: Mapped[str] = mapped_column(String(500))
    resolved: Mapped[bool] = mapped_column(Boolean, default=False)
```

### Backend: Purchase Logic (`backend/app/services.py`)

This function handles the purchase transaction, including `SELECT ... FOR UPDATE` locking via SQLAlchemy to prevent race conditions, and atomically writes the stock deduction + log + optional alert within a single `db.begin()` block.

```python
def get_product_for_update(db: Session, *, sku: str) -> Product:
    stmt = select(Product).where(Product.sku == sku).with_for_update()
    try:
        return db.execute(stmt).scalars().one()
    except NoResultFound as e:
        raise NotFoundError(f"SKU not found: {sku}") from e

def purchase(db: Session, *, sku: str, quantity: int) -> StockChangeResult:
    if quantity <= 0:
        raise ValidationError("quantity must be > 0")

    # Atomic transaction + row locking prevents overselling under concurrency.
    with db.begin():
        product = get_product_for_update(db, sku=sku)

        # Overselling prevention: validate BEFORE any write
        if product.quantity < quantity:
            raise ValidationError("Insufficient stock")

        product.quantity -= quantity
        log = InventoryLog(product_id=product.id, type="SALE", delta=-quantity)
        db.add(log)

        alert: Alert | None = None
        if product.quantity <= product.low_stock_threshold:
            alert = Alert(
                product_id=product.id,
                kind="LOW_STOCK",
                message=f"Low stock: {product.sku} remaining {product.quantity} "
                        f"(threshold {product.low_stock_threshold})"
            )
            db.add(alert)
    # Atomic COMMIT (or ROLLBACK on any exception, including log/alert failures)

    db.refresh(product)
    db.refresh(log)
    if alert is not None:
        db.refresh(alert)
    return StockChangeResult(product=product, log=log, low_stock_alert=alert)
```

---

## 4. Test Script (`tests/inventory.test.js`)

Integration tests run against the live Docker stack (`http://localhost:8000`), verifying each scenario end-to-end via HTTP + direct DB queries.

```javascript
const axios = require("axios");
const { Pool } = require("pg");

const api = axios.create({ baseURL: "http://localhost:8000", validateStatus: () => true });
const pool = new Pool({ host: "127.0.0.1", port: 5432, user: "inventory",
                        password: "inventory", database: "inventory" });

test("Scenario 1: Successful Stock Deduction", async () => {
  // SKU-001 starts at 10. Buy 2. Expect 8.
  const res = await api.post("/api/purchase", { sku: "SKU-001", quantity: 2 });
  expect(res.status).toBe(200);
  expect(res.data.quantity).toBe(8);

  const { rows: logRows } = await pool.query(
    "SELECT type, delta FROM inventory_logs il JOIN products p ON p.id = il.product_id WHERE p.sku = $1",
    ["SKU-001"]
  );
  expect(logRows[0].type).toBe("SALE");
  expect(logRows[0].delta).toBe(-2);
});

test("Edge Case 1: Race Condition", async () => {
  // SKU-004 has 1 item. Fire 5 concurrent purchase requests.
  const requests = Array(5).fill(null).map(() =>
    api.post("/api/purchase", { sku: "SKU-004", quantity: 1 })
  );
  const results = await Promise.all(requests);

  expect(results.filter(r => r.status === 200).length).toBe(1);
  expect(results.filter(r => r.status !== 200).length).toBe(4);

  const { rows } = await pool.query("SELECT quantity FROM products WHERE sku = $1", ["SKU-004"]);
  expect(rows[0].quantity).toBe(0);
});
```

---

## 5. Key Differences vs IMCE01

| Aspect | IMCE01 (Node.js/Express) | IMCS01 (FastAPI/Python) |
|---|---|---|
| **Language / Framework** | Node.js + Express | Python + FastAPI |
| **ORM / DB layer** | Raw `pg` SQL queries | SQLAlchemy ORM |
| **Request body** | `{ productId, quantity }` | `{ sku, quantity }` |
| **Lock mechanism** | `SELECT … FOR UPDATE` (raw SQL) | `.with_for_update()` (SQLAlchemy) |
| **Log table** | `inventory_log` (`quantity int`) | `inventory_logs` (`delta int`, signed) |
| **Alert storage** | Row in `inventory_log` (type: `LOW_STOCK_ALERT`) | Separate `alerts` table (kind: `LOW_STOCK`) |
| **Insufficient stock HTTP status** | 409 | 400 |
| **Test approach** | `supertest` (in-process) | `axios` + `pg` (integration against Docker) |

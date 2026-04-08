# Inventory Management System Test Report

**Date:** April 3, 2026
**Project Version:** IMSD01 (Inventory System)

## 1. Test Summary

All scenarios defined in [`scenarios_inventory.md`](./scenarios_inventory.md) have been tested using `pytest` against the IMSD01 backend test suite.

| Scenario | Result | Notes |
|---|---|---|
| **1) Successful Stock Deduction** | ✅ PASS | Stock reduced correctly from 10 to 8, and `InventoryLog` recorded `SALE` with `-2`. |
| **2) Low Stock Alert Trigger** | ✅ PASS | Stock reduced from 6 to 4, and an `Alert` record was created because `4 <= 5`. |
| **3) Stock Restoration** | ✅ PASS | Stock restored from 5 to 6 for both `cancelled` and `expired` flows, with correct log operation recorded. |
| **Edge 1) Race Condition** | ✅ PASS | Concurrent purchase test allowed only 1 success out of 5 requests. Final stock remained 0. |
| **Edge 2) Transaction Atomicity** | ✅ PASS | When log creation was forced to fail, the stock update was rolled back and no log was persisted. |
| **Edge 3) Overselling Attempt** | ✅ PASS | Purchase request beyond available stock raised `InsufficientStockError`, and stock remained unchanged at 5. |
| **Edge 4) Boundary Value** | ✅ PASS | Alert behavior matched the spec exactly: no alert at 6, alert at 5, alert at 4. |

---

### Unit Tests

| Test | Result | Notes |
| --- | --- | --- |
| `test_purchase_creates_log_and_updates_stock` | ✅ PASS | `purchase()` reduces stock from 10 to 8, creates `InventoryLog` with `operation="SALE"`, `quantity_delta=-2`. |
| `test_insufficient_stock_rejected` | ✅ PASS | `purchase()` with quantity=6 on stock=5 raises `InsufficientStockError`. |
| `test_low_stock_threshold_boundary` | ✅ PASS | Alert created at remaining=5 (≤ threshold) and again at remaining=4; not triggered above threshold. |
| `test_restore_creates_log_and_updates_stock` | ✅ PASS | `restore()` increases stock from 5 to 6, creates `InventoryLog` with `operation="RESTOCK"`, `quantity_delta=1`. |

### Contract Tests

| Test | Result | Notes |
| --- | --- | --- |
| `test_purchase_contract_success` | ✅ PASS | `POST /inventory/purchase` returns `status="success"`, `deducted=2`, `remaining=8`. |
| `test_cancel_contract_success` | ✅ PASS | `POST /inventory/cancel` returns `status="success"`, `restored=1`, `remaining=6`. |

### Integration Tests

| Test | Result | Notes |
| --- | --- | --- |
| `test_purchase_rolls_back_on_log_failure` | ✅ PASS | When `InventoryLog` insert fails, stock update rolls back; stock remains 5, no logs persisted. |
| `test_low_stock_alert_created_on_purchase` | ✅ PASS | Purchase via API triggers alert record when remaining stock (4) ≤ threshold (5). |
| `test_restore_stock_flow` | ✅ PASS | Cancel via API with `reason="expired"` creates `InventoryLog` with `operation="RETURN"`. |
| `test_concurrent_purchases_only_one_succeeds` | ✅ PASS | 5 concurrent threads with stock=1: exactly 1 succeeds, 4 raise `InsufficientStockError`, final stock=0. |

**Total: 18 passed, 0 failed**

---

## 2. Test Output

```text
$ pytest tests/ -v
============================= test session starts ==============================
platform darwin -- Python 3.12.12, pytest-9.0.2, pluggy-1.6.0
rootdir: /Users/phatchareepuangjai/Documents/chat_gsheet_logger_python/src/versions/IMSD01/backend
configfile: pyproject.toml
plugins: anyio-4.12.1, asyncio-1.3.0
asyncio: mode=Mode.STRICT
collected 18 items

tests/contract/test_inventory_cancel.py::test_cancel_contract_success PASSED
tests/contract/test_inventory_purchase.py::test_purchase_contract_success PASSED
tests/integration/test_low_stock_alert.py::test_low_stock_alert_created_on_purchase PASSED
tests/integration/test_purchase_atomicity.py::test_purchase_rolls_back_on_log_failure PASSED
tests/integration/test_purchase_concurrency.py::test_concurrent_purchases_only_one_succeeds PASSED
tests/integration/test_restore_stock.py::test_restore_stock_flow PASSED
tests/test_inventory_scenarios.py::TestInventoryScenarios::test_1_successful_stock_deduction PASSED
tests/test_inventory_scenarios.py::TestInventoryScenarios::test_2_low_stock_alert_trigger PASSED
tests/test_inventory_scenarios.py::TestInventoryScenarios::test_3_stock_restoration[cancelled-RESTOCK] PASSED
tests/test_inventory_scenarios.py::TestInventoryScenarios::test_3_stock_restoration[expired-RETURN] PASSED
tests/test_inventory_scenarios.py::TestInventoryEdgeCases::test_edge_case_1_race_condition PASSED
tests/test_inventory_scenarios.py::TestInventoryEdgeCases::test_edge_case_2_transaction_atomicity PASSED
tests/test_inventory_scenarios.py::TestInventoryEdgeCases::test_edge_case_3_overselling_attempt PASSED
tests/test_inventory_scenarios.py::TestInventoryEdgeCases::test_edge_case_4_boundary_value_low_stock PASSED
tests/unit/test_inventory_service_purchase.py::test_purchase_creates_log_and_updates_stock PASSED
tests/unit/test_inventory_service_restore.py::test_restore_creates_log_and_updates_stock PASSED
tests/unit/test_low_stock_threshold.py::test_low_stock_threshold_boundary PASSED
tests/unit/test_purchase_boundary.py::test_insufficient_stock_rejected PASSED

============================== 18 passed in 0.08s ==============================
```

---

## 3. Code Implementation Details

### Backend: Scenario Test File (`backend/tests/test_inventory_scenarios.py`)

The IMSD01 version uses a dedicated `pytest` scenario suite that maps directly to the acceptance scenarios and edge cases in `scenarios_inventory.md`.

```python
class TestInventoryScenarios:
    def test_1_successful_stock_deduction(self, db_session):
        ...

    def test_2_low_stock_alert_trigger(self, db_session):
        ...

    def test_3_stock_restoration(self, db_session, reason, expected_operation):
        ...


class TestInventoryEdgeCases:
    def test_edge_case_1_race_condition(self):
        ...

    def test_edge_case_2_transaction_atomicity(self, db_session, monkeypatch):
        ...

    def test_edge_case_3_overselling_attempt(self, db_session):
        ...

    def test_edge_case_4_boundary_value_low_stock(self, db_session):
        ...
```

### Backend: Purchase Logic (`backend/src/services/inventory_service.py`)

The `purchase` function updates stock inside a transaction, creates an audit log, and triggers a low-stock alert when the remaining quantity is less than or equal to the threshold.

```python
def purchase(session: Session, product_id: str, sku: str, quantity: int):
    if quantity <= 0:
        raise ValidationError("Quantity must be greater than zero")

    with _transaction(session):
        product = session.execute(
            select(Product).where(Product.id == product_id, Product.sku == sku)
        ).scalar_one_or_none()

        result = session.execute(
            update(Product)
            .where(
                Product.id == product_id,
                Product.sku == sku,
                Product.available_qty >= quantity,
            )
            .values(available_qty=Product.available_qty - quantity)
        )

        log = InventoryLog(
            id=str(uuid4()),
            product_id=product.id,
            operation="SALE",
            quantity_delta=-quantity,
        )
        session.add(log)

        if product.available_qty <= product.low_stock_threshold:
            alert = create_low_stock_alert(session, product.id, product.available_qty)
```

### Backend: Restore Logic (`backend/src/services/inventory_service.py`)

The `restore` function restores stock and writes either `RESTOCK` or `RETURN` depending on the input reason.

```python
def restore(session: Session, product_id: str, sku: str, quantity: int, reason: str):
    if reason not in {"cancelled", "expired"}:
        raise ValidationError("Order not cancellable")

    operation = "RESTOCK" if reason == "cancelled" else "RETURN"

    with _transaction(session):
        stmt = (
            select(Product)
            .where(Product.id == product_id, Product.sku == sku)
            .with_for_update()
        )
        product = session.execute(stmt).scalar_one_or_none()

        product.available_qty += quantity

        log = InventoryLog(
            id=str(uuid4()),
            product_id=product.id,
            operation=operation,
            quantity_delta=quantity,
        )
        session.add(log)
```

## 4. Test Command

Run the scenario suite from [`backend`](./backend) with either of the following commands:

```bash
pytest tests/test_inventory_scenarios.py
pytest -m scenarios
```

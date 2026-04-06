# Shopping Cart System Test Report

**Date:** April 5, 2026
**Project Version:** SCSD01 (Python — OOP Service Layer)

## 1. Test Summary

All scenarios defined in `scenarios_cart.md` have been tested using pytest.

### Scenario Tests (`tests/test_cart_scenarios.py`)

| Scenario | Result | Notes |
|---|---|---|
| **1) Update Item Quantity** | ✅ PASS | Quantity updated to 3, Line Total = 30,000 cents, Grand Total correct. |
| **2) Merge Items Logic** | ✅ PASS | No duplicate rows, quantity merged to 3, total = 30,000 cents. |
| **3) Save for Later** | ✅ PASS | Item status changed to SAVED, excluded from active total (total = 0). |
| **Edge 1) Add More Than Stock** | ✅ PASS | Blocked with error `สินค้าไม่เพียงพอ`, quantity remained at 3. |
| **Edge 2) Floating Point Calculation** | ✅ PASS | Integer cents calculation ensures precision (19.99 × 3 = 5,997 cents = 59.97). |

### Unit Tests

| Test | Result | Notes |
|---|---|---|
| `test_with_quantity_updates_correctly` | ✅ PASS | `with_quantity(5)` returns new CartItem with quantity=5, line_total=50,000 cents. |
| `test_save_for_later_changes_status` | ✅ PASS | `save_for_later()` returns new item with `status="SAVED"`, original unchanged. |
| `test_with_quantity_raises_on_zero` | ✅ PASS | `with_quantity(0)` raises `ValueError`. |
| `test_can_add_within_stock` | ✅ PASS | `can_add("SKU-001", 2, 3)` returns `True` when stock=5. |
| `test_cannot_add_exceeds_stock` | ✅ PASS | `can_add("SKU-001", 3, 3)` returns `False` when stock=5. |
| `test_unknown_sku_returns_zero_stock` | ✅ PASS | Unknown SKU returns `available=0`, `can_add` returns `False`. |
| `test_from_amount_decimal_precision` | ✅ PASS | `Money.from_amount("19.99").cents == 1999`. |
| `test_to_cents_rounds_half_up` | ✅ PASS | `to_cents("0.005") == 1` (ROUND_HALF_UP). |

### Integration Tests

| Test | Result | Notes |
|---|---|---|
| `test_add_same_sku_merges_quantity` | ✅ PASS | Add qty=2 then qty=3 same SKU → one item, qty=5, total=50,000 cents. |
| `test_saved_item_excluded_from_total` | ✅ PASS | Cart with SKU-A (SAVED) + SKU-B (ACTIVE) → total = SKU-B only (30,000 cents). |
| `test_add_blocked_when_cumulative_exceeds_stock` | ✅ PASS | Second add blocked, first item stays at qty=3. |

**Total: 16 passed, 0 failed**

---

## 2. Test Output

```text
$ python -m pytest tests/ -v

============================= test session starts ==============================
platform darwin -- Python 3.12.12, pytest-9.0.2, pluggy-1.6.0
asyncio: mode=Mode.STRICT
collected 16 items

tests/integration/test_add_and_merge_flow.py::test_add_same_sku_merges_quantity PASSED [  6%]
tests/integration/test_save_for_later_flow.py::test_saved_item_excluded_from_total PASSED [ 12%]
tests/integration/test_stock_limit_enforcement.py::test_add_blocked_when_cumulative_exceeds_stock PASSED [ 18%]
tests/test_cart_scenarios.py::TestCartScenarios::test_1_update_item_quantity PASSED [ 25%]
tests/test_cart_scenarios.py::TestCartScenarios::test_2_merge_items_logic PASSED [ 31%]
tests/test_cart_scenarios.py::TestCartScenarios::test_3_save_for_later PASSED [ 37%]
tests/test_cart_scenarios.py::TestCartEdgeCases::test_edge_case_1_add_more_than_stock PASSED [ 43%]
tests/test_cart_scenarios.py::TestCartEdgeCases::test_edge_case_2_floating_point_calculation PASSED [ 50%]
tests/unit/test_cart_item_operations.py::test_with_quantity_updates_correctly PASSED [ 56%]
tests/unit/test_cart_item_operations.py::test_save_for_later_changes_status PASSED [ 62%]
tests/unit/test_cart_item_operations.py::test_with_quantity_raises_on_zero PASSED [ 68%]
tests/unit/test_inventory_can_add.py::test_can_add_within_stock PASSED   [ 75%]
tests/unit/test_inventory_can_add.py::test_cannot_add_exceeds_stock PASSED [ 81%]
tests/unit/test_inventory_can_add.py::test_unknown_sku_returns_zero_stock PASSED [ 87%]
tests/unit/test_money_precision.py::test_from_amount_decimal_precision PASSED [ 93%]
tests/unit/test_money_precision.py::test_to_cents_rounds_half_up PASSED  [100%]

============================== 16 passed in 0.01s ==============================
```

---

## 3. Code Implementation Details

### Data Models (`src/models/`)

`Cart` is a **frozen dataclass** (immutable). All mutations return a new instance via `with_items()`.

```python
@dataclass(frozen=True)
class Cart:
    items: List[CartItem]

    def with_items(self, items: Iterable[CartItem]) -> "Cart":
        return replace(self, items=list(items))

    def active_items(self) -> List[CartItem]:
        return [item for item in self.items if item.status == "ACTIVE"]

    def saved_items(self) -> List[CartItem]:
        return [item for item in self.items if item.status == "SAVED"]

    def total(self) -> Money:
        total_cents = sum(item.line_total.cents for item in self.active_items())
        return Money(total_cents)
```

### CartService: Add & Merge Logic (`src/services/cart_service.py`)

Stock check uses `InventorySnapshot.can_add(sku, current_qty, requested_qty)`. Returns `CartResult` with optional `error` string instead of raising exceptions.

```python
def add_item(self, cart: Cart, sku: str, unit_price: Money, quantity: int) -> CartResult:
    items = list(cart.items)
    index = self._find_active_index(items, sku)
    current_qty = items[index].quantity if index is not None else 0

    if not self.inventory.can_add(sku, current_qty, quantity):
        return CartResult(cart=cart, error=STOCK_EXCEEDED_MESSAGE)

    if index is None:
        items.append(CartItem(sku=sku, unit_price=unit_price, quantity=quantity))
    else:
        existing = items[index]
        items[index] = existing.with_quantity(existing.quantity + quantity)

    return CartResult(cart=cart.with_items(items))
```

### CartService: Save for Later (`src/services/cart_service.py`)

Uses `save_for_later()` on `CartItem` which returns a new item with `status="SAVED"`.

```python
def save_for_later(self, cart: Cart, sku: str) -> CartResult:
    items = list(cart.items)
    index = self._find_active_index(items, sku)
    if index is None:
        return CartResult(cart=cart, error="item not found")

    items[index] = items[index].save_for_later()
    return CartResult(cart=cart.with_items(items))
```

### Money Precision (`src/lib/money.py`)

Uses `Decimal` with `ROUND_HALF_UP` to avoid floating-point errors.

```python
def to_cents(amount: Any) -> int:
    value = Decimal(str(amount))
    quantized = value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    return int(quantized * 100)
```

---

## 4. Test Script Highlights

### `tests/test_cart_scenarios.py`

```python
class TestCartScenarios:
    def test_1_update_item_quantity(self):
        service = _service({"SKU-001": 10})
        cart = Cart.empty()

        result = service.add_item(cart, "SKU-001", Money.from_amount("100.00"), 1)
        result = service.update_quantity(result.cart, "SKU-001", 3)

        assert result.error is None
        summary = service.summary(result.cart)
        assert summary["active_items"][0].quantity == 3
        assert summary["active_items"][0].line_total.cents == 30000
        assert summary["total"].cents == 30000

    def test_edge_case_1_add_more_than_stock(self):
        service = _service({"SKU-005": 5})
        cart = Cart.empty()

        result = service.add_item(cart, "SKU-005", Money.from_amount("50.00"), 3)
        blocked = service.add_item(result.cart, "SKU-005", Money.from_amount("50.00"), 3)

        assert blocked.error == STOCK_EXCEEDED_MESSAGE
        assert blocked.cart.active_items()[0].quantity == 3
        assert blocked.cart.total().cents == 15000

    def test_edge_case_2_floating_point_calculation(self):
        service = _service({"SKU-006": 100})
        cart = Cart.empty()

        result = service.add_item(cart, "SKU-006", Money.from_amount("19.99"), 3)

        assert result.cart.total().cents == 5997
        assert result.cart.total().format() == "59.97"
```

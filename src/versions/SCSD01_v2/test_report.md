# Shopping Cart System Test Report

**Date:** April 5, 2026
**Project Version:** SCSD01_v2 (Python — Functional / Module-Level)

## 1. Test Summary

All scenarios defined in `scenarios_cart.md` have been tested using pytest.

### Scenario Tests (`tests/test_cart_scenarios.py`)

| Scenario | Result | Notes |
|---|---|---|
| **1) Update Item Quantity** | ✅ PASS | Quantity updated to 3, Line Total = 300.00 THB, Grand Total correct. |
| **2) Merge Items Logic** | ✅ PASS | No duplicate rows, quantity merged to 3, total = 300.00 THB. |
| **3) Save for Later** | ✅ PASS | Item moved to `saved_items`, excluded from active total (total = 0). |
| **Edge 1) Add More Than Stock** | ✅ PASS | Rejected with `InsufficientStockError`, quantity remained at 3. |
| **Edge 2) Floating Point Calculation** | ✅ PASS | Integer minor-unit calculation ensures precision (19.99 × 3 = 5,997 = 59.97). |

### Unit Tests

| Test | Result | Notes |
|---|---|---|
| `test_merge_duplicate_items_on_add` | ✅ PASS | Same SKU added twice → one item, qty=3. |
| `test_merge_respects_stock_limit` | ✅ PASS | Second add exceeding stock raises `InsufficientStockError`. |
| `test_save_for_later_moves_item` | ✅ PASS | `save_for_later()` empties `items`, saves to `saved_items`. |
| `test_cart_total_updates_with_quantity` | ✅ PASS | `calculate_line_total` and `calculate_cart_total` return 30,000 minor units. |
| `test_money_precision_round_trip` | ✅ PASS | `to_minor("19.99") == 1999`; `format_minor(5997) == "59.97"`. |
| `test_money_format_two_decimals` | ✅ PASS | `format_minor(10000) == "100.00"`. |

### Integration Tests

| Test | Result | Notes |
|---|---|---|
| `test_update_quantity_recalculates_totals` | ✅ PASS | After `update_quantity(qty=3)`, total = 30,000 minor units. |
| `test_add_merge_workflow` | ✅ PASS | Add qty=1 then qty=2 same SKU → one item, qty=3. |
| `test_save_for_later_workflow` | ✅ PASS | `save_for_later` moves item out of `items` into `saved_items`, total=0. |
| `test_update_quantity_rejects_stock_overflow` | ✅ PASS | `update_quantity(qty=6, stock=5)` raises `InsufficientStockError`, qty stays at 3. |

**Total: 15 passed, 0 failed**

---

## 2. Test Output

```text
$ python -m pytest tests/ -v

============================= test session starts ==============================
platform darwin -- Python 3.12.12, pytest-9.0.2, pluggy-1.6.0
configfile: pyproject.toml
asyncio: mode=Mode.STRICT
collected 15 items

tests/integration/test_cart_workflows.py::test_update_quantity_recalculates_totals PASSED [  6%]
tests/integration/test_cart_workflows.py::test_add_merge_workflow PASSED [ 13%]
tests/integration/test_cart_workflows.py::test_save_for_later_workflow PASSED [ 20%]
tests/integration/test_cart_workflows.py::test_update_quantity_rejects_stock_overflow PASSED [ 26%]
tests/test_cart_scenarios.py::TestCartScenarios::test_1_update_item_quantity PASSED [ 33%]
tests/test_cart_scenarios.py::TestCartScenarios::test_2_merge_items_logic PASSED [ 40%]
tests/test_cart_scenarios.py::TestCartScenarios::test_3_save_for_later PASSED [ 46%]
tests/test_cart_scenarios.py::TestCartEdgeCases::test_edge_case_1_add_more_than_stock PASSED [ 53%]
tests/test_cart_scenarios.py::TestCartEdgeCases::test_edge_case_2_floating_point_calculation PASSED [ 60%]
tests/unit/test_cart_models.py::test_merge_duplicate_items_on_add PASSED [ 66%]
tests/unit/test_cart_models.py::test_merge_respects_stock_limit PASSED   [ 73%]
tests/unit/test_cart_models.py::test_save_for_later_moves_item PASSED    [ 80%]
tests/unit/test_cart_totals.py::test_cart_total_updates_with_quantity PASSED [ 86%]
tests/unit/test_money.py::test_money_precision_round_trip PASSED         [ 93%]
tests/unit/test_money.py::test_money_format_two_decimals PASSED          [100%]

============================== 15 passed in 0.01s ==============================
```

---

## 3. Code Implementation Details

### Data Models (`src/cart/models.py`)

`Cart` is a **mutable dataclass** with separate `items` and `saved_items` lists. Stock enforcement is done via exceptions rather than result objects.

```python
@dataclass
class CartItem:
    sku: str
    name: str
    unit_price_minor: int
    quantity: int

    @property
    def line_total_minor(self) -> int:
        return self.unit_price_minor * self.quantity


@dataclass
class Cart:
    currency: str
    items: List[CartItem] = field(default_factory=list)
    saved_items: List[SavedItem] = field(default_factory=list)

    def find_item(self, sku: str) -> Optional[CartItem]: ...
    def remove_item(self, sku: str) -> Optional[CartItem]: ...
```

### Add & Merge Logic (`src/cart/service.py`)

Module-level function. Raises `InsufficientStockError` when cumulative quantity exceeds available stock.

```python
def add_item(cart, sku, name, unit_price_minor, quantity, available_stock) -> Cart:
    existing = cart.find_item(sku)
    current_qty = existing.quantity if existing else 0
    if current_qty + quantity > available_stock:
        raise InsufficientStockError("insufficient stock")

    if existing:
        existing.quantity += quantity          # mutate in-place
    else:
        cart.items.append(CartItem(...))
    return cart
```

### Save for Later (`src/cart/service.py`)

Removes item from `cart.items` and appends to `cart.saved_items` as a `SavedItem` (no quantity, records `saved_at` timestamp).

```python
def save_for_later(cart: Cart, sku: str) -> Cart:
    item = cart.remove_item(sku)
    if item is None:
        raise ItemNotFoundError("item not found")

    cart.saved_items.append(
        SavedItem(sku=item.sku, name=item.name, unit_price_minor=item.unit_price_minor)
    )
    return cart
```

### Totals (`src/cart/totals.py`)

Pure functions that compute totals from model objects using integer minor units.

```python
def calculate_line_total(item: CartItem) -> int:
    return item.unit_price_minor * item.quantity

def calculate_cart_total(cart: Cart) -> int:
    return sum(calculate_line_total(item) for item in cart.items)
```

### Money Precision (`src/lib/money.py`)

Uses `Decimal` with `ROUND_HALF_UP` for conversion; stores all values as integer minor units.

```python
def to_minor(amount: str) -> int:
    value = Decimal(amount)
    quantized = value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    return int(quantized * 100)

def format_minor(minor: int) -> str:
    return f"{minor // 100}.{minor % 100:02d}"
```

---

## 4. Test Script Highlights

### `tests/test_cart_scenarios.py`

```python
class TestCartScenarios:
    def test_1_update_item_quantity(self):
        cart = Cart(currency="THB")
        add_item(cart, sku="A", name="Item A", unit_price_minor=to_minor("100.00"),
                 quantity=1, available_stock=10)
        update_quantity(cart, sku="A", quantity=3, available_stock=10)

        item = cart.items[0]
        assert item.quantity == 3
        assert calculate_line_total(item) == to_minor("300.00")
        assert calculate_cart_total(cart) == to_minor("300.00")

    def test_edge_case_1_add_more_than_stock(self):
        cart = Cart(currency="THB")
        add_item(cart, sku="SKU-005", name="Limited Item",
                 unit_price_minor=to_minor("50.00"), quantity=3, available_stock=5)

        with pytest.raises(InsufficientStockError, match="insufficient stock"):
            add_item(cart, sku="SKU-005", name="Limited Item",
                     unit_price_minor=to_minor("50.00"), quantity=3, available_stock=5)

        assert cart.items[0].quantity == 3
        assert calculate_cart_total(cart) == to_minor("150.00")

    def test_edge_case_2_floating_point_calculation(self):
        cart = Cart(currency="THB")
        add_item(cart, sku="SKU-006", name="Decimal Item",
                 unit_price_minor=to_minor("19.99"), quantity=3, available_stock=10)

        assert calculate_line_total(cart.items[0]) == 5997
        assert calculate_cart_total(cart) == 5997
        assert format_minor(calculate_cart_total(cart)) == "59.97"
```

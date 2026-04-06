# Promotions & Discounts System Test Report

**Date:** April 5, 2026
**Project Version:** PDSD01 (Python — Functional Pricing Engine)

## 1. Test Summary

All scenarios defined in `scenarios_promotions.md` have been tested using pytest.

### Scenario Tests (`backend/tests/test_promotions_scenarios.py`)

| Scenario | Result | Notes |
|---|---|---|
| **1) Coupon Validation** | ✅ PASS | SAVE100 applied, grand_total = 900, discount line item recorded. |
| **2) Cart Total Discount %** | ✅ PASS | PROMO10 (10%) applied to 2000 → grand_total = 1800. |
| **3) Expiration Date Check** | ✅ PASS | EXPIRED coupon rejected, grand_total unchanged at 1000. |
| **Edge 1) Coupon Usage Limit** | ✅ PASS | WELCOME coupon blocked when usage_count = 1, message = USAGE_LIMIT_REACHED. |
| **Edge 2) Order of Operations** | ✅ PASS | Promotion applied first, then coupon — discounts = [100, 100], grand_total = 800. |
| **Edge 3) Negative Total Protection** | ✅ PASS | Subtotal 50 with 100 coupon clamped to grand_total = 0. |

### Unit Tests

| Test | Result | Notes |
|---|---|---|
| `test_apply_fixed_coupon_discount` | ✅ PASS | `apply_fixed_coupon_discount(1000, 100) == 900`. |
| `test_coupon_expired` | ✅ PASS | `is_expired(now - 1day, now)` returns `True`. |
| `test_usage_limit_reached` | ✅ PASS | `apply_coupon` returns `(None, USAGE_LIMIT_REACHED)` when usage_count=1. |
| `test_validate_minimum_spend_passes` | ✅ PASS | `validate_minimum_spend(1000, 500)` returns `True`. |
| `test_validate_minimum_spend_fails` | ✅ PASS | `validate_minimum_spend(400, 500)` returns `False`. |
| `test_percentage_discount_calculation` | ✅ PASS | `calculate_percentage_discount(2000, 10) == 200`. |
| `test_total_clamps_to_zero` | ✅ PASS | `apply_fixed_coupon_discount(50, 100) == 0`. |

### Integration Tests

| Test | Result | Notes |
|---|---|---|
| `test_coupon_apply_success` | ✅ PASS | SAVE100 on cart subtotal 1000 → grand_total = 900, message confirmed. |
| `test_expired_coupon_rejected` | ✅ PASS | EXPIRED coupon → grand_total unchanged, "Coupon expired" in messages. |
| `test_usage_limit_rejected` | ✅ PASS | WELCOME coupon with usage_count=1 → grand_total unchanged, "Usage limit reached". |
| `test_percentage_promo_applied` | ✅ PASS | PROMO10 on subtotal 2000 → grand_total = 1800. |
| `test_pricing_performance_budget` | ✅ PASS | `evaluate_pricing` completes in < 0.2s. |

**Total: 18 passed, 0 failed**

---

## 2. Test Output

```text
$ python -m pytest tests/ -v

============================= test session starts ==============================
platform darwin -- Python 3.12.12, pytest-9.0.2, pluggy-1.6.0
asyncio: mode=Mode.STRICT
collected 18 items

tests/integration/test_coupon_apply.py::test_coupon_apply_success PASSED [  5%]
tests/integration/test_invalid_coupons.py::test_expired_coupon_rejected PASSED [ 11%]
tests/integration/test_invalid_coupons.py::test_usage_limit_rejected PASSED [ 16%]
tests/integration/test_percentage_promo.py::test_percentage_promo_applied PASSED [ 22%]
tests/integration/test_pricing_performance.py::test_pricing_performance_budget PASSED [ 27%]
tests/test_promotions_scenarios.py::TestPromotionsScenarios::test_1_coupon_validation PASSED [ 33%]
tests/test_promotions_scenarios.py::TestPromotionsScenarios::test_2_cart_total_discount_percent PASSED [ 38%]
tests/test_promotions_scenarios.py::TestPromotionsScenarios::test_3_expiration_date_check PASSED [ 44%]
tests/test_promotions_scenarios.py::TestPromotionsEdgeCases::test_edge_1_coupon_usage_limit PASSED [ 50%]
tests/test_promotions_scenarios.py::TestPromotionsEdgeCases::test_edge_2_order_of_operations PASSED [ 55%]
tests/test_promotions_scenarios.py::TestPromotionsEdgeCases::test_edge_3_negative_total_protection PASSED [ 61%]
tests/unit/test_coupon_discount.py::test_apply_fixed_coupon_discount PASSED [ 66%]
tests/unit/test_coupon_expiration.py::test_coupon_expired PASSED         [ 72%]
tests/unit/test_coupon_usage.py::test_usage_limit_reached PASSED         [ 77%]
tests/unit/test_coupon_validation.py::test_validate_minimum_spend_passes PASSED [ 83%]
tests/unit/test_coupon_validation.py::test_validate_minimum_spend_fails PASSED [ 88%]
tests/unit/test_percentage_discount.py::test_percentage_discount_calculation PASSED [ 94%]
tests/unit/test_total_clamp.py::test_total_clamps_to_zero PASSED         [100%]

============================== 18 passed, 23 warnings in 0.02s ==============================
```

> Note: 23 warnings เกิดจากการใช้ `datetime.utcnow()` ซึ่ง deprecated ใน Python 3.12 — ไม่กระทบผลการทดสอบ

---

## 3. Code Implementation Details

### Data Models (`backend/src/pricing/evaluator.py`)

`Cart`, `CartItem`, `DiscountLineItem`, และ `PricingResult` ทั้งหมดเป็น **frozen dataclasses** (immutable).

```python
@dataclass(frozen=True)
class Cart:
    cart_id: str
    customer_id: str
    currency: str
    items: List[CartItem]
    subtotal: int

@dataclass(frozen=True)
class DiscountLineItem:
    type: str       # "promotion" | "coupon"
    source_id: str
    amount: int
    order: int      # ใช้เรียงลำดับ: promotion ก่อน coupon

@dataclass(frozen=True)
class PricingResult:
    discount_line_items: List[DiscountLineItem]
    grand_total: int
    messages: List[str]
```

### Pricing Evaluator: Order of Operations (`backend/src/pricing/evaluator.py`)

Promotion (% discount) ถูกประมวลผลก่อน Coupon (fixed discount) เสมอ โดยใช้ `order` field เรียงลำดับ.

```python
def evaluate_pricing(cart, coupon_code=None, promotions=None, ...) -> PricingResult:
    line_items = []
    # 1. Promotions first (percentage)
    for promo in promotions or []:
        discount_amount = calculate_percentage_discount(cart.subtotal, promo.percent)
        line_items.append(DiscountLineItem(type="promotion", ..., order=PERCENTAGE_ORDER))
    # 2. Coupons second (fixed value)
    if coupon_code:
        discount_value, message = apply_coupon(cart.subtotal, coupon_code, now, ...)
        if discount_value:
            line_items.append(DiscountLineItem(type="coupon", ..., order=FIXED_ORDER))
    ordered = order_discounts(line_items)
    total_discount = sum(item.amount for item in ordered)
    return PricingResult(
        discount_line_items=ordered,
        grand_total=clamp_total(cart.subtotal - total_discount),
        messages=messages,
    )
```

### Coupon Validation (`backend/src/pricing/coupons.py`)

ตรวจสอบ 3 เงื่อนไขตามลำดับ: expiration → minimum spend → usage limit.

```python
def apply_coupon(subtotal, coupon_code, now, usage_count=None, ...) -> tuple[Optional[int], str]:
    coupon = coupon_lookup(coupon_code)
    if is_expired(coupon.expires_at, now):
        return None, COUPON_EXPIRED
    if not validate_minimum_spend(subtotal, coupon.minimum_spend):
        return None, MINIMUM_SPEND_NOT_MET
    if usage_count and usage_count(coupon_code) >= coupon.usage_limit_per_customer:
        return None, USAGE_LIMIT_REACHED
    return coupon.discount_value, COUPON_APPLIED
```

### Negative Total Protection (`backend/src/pricing/calculations.py`)

`clamp_total` ป้องกันไม่ให้ grand_total ติดลบ.

```python
def clamp_total(total: int) -> int:
    return max(0, total)
```

---

## 4. Test Script Highlights

### `backend/tests/test_promotions_scenarios.py`

```python
class TestPromotionsScenarios:
    def test_1_coupon_validation(self):
        cart = _build_cart(1000)
        result = evaluate_pricing(cart, coupon_code="SAVE100")

        assert result.grand_total == 900
        assert COUPON_APPLIED in result.messages
        assert result.discount_line_items[0].type == "coupon"
        assert result.discount_line_items[0].amount == 100

    def test_2_cart_total_discount_percent(self):
        cart = _build_cart(2000)
        promo = PromotionDefinition(promo_id="PROMO10", percent=10)
        result = evaluate_pricing(cart, promotions=[promo])

        assert result.grand_total == 1800
        assert result.discount_line_items[0].type == "promotion"
        assert result.discount_line_items[0].amount == 200


class TestPromotionsEdgeCases:
    def test_edge_2_order_of_operations(self):
        cart = _build_cart(1000)
        promo = PromotionDefinition(promo_id="PROMO10", percent=10)
        result = evaluate_pricing(cart, coupon_code="SAVE100", promotions=[promo])

        # promotion applied first, then coupon
        assert [item.type for item in result.discount_line_items] == ["promotion", "coupon"]
        assert [item.amount for item in result.discount_line_items] == [100, 100]
        assert result.grand_total == 800

    def test_edge_3_negative_total_protection(self):
        cart = _build_cart(50, customer_id="cust-2")
        result = evaluate_pricing(cart, coupon_code="WELCOME")

        assert result.grand_total == 0  # clamped, not negative
```

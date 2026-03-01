# Shopping Cart System Test Report (SCCS01)

**Date:** March 1, 2026
**Project Version:** shopping-cart SCCS01

## 1. Test Summary

All scenarios defined in `scenarios_cart.md` have been tested using Jest (integration tests against the running Docker stack).

| Scenario | Result | Notes |
|---|---|---|
| **1) Update Item Quantity** | ✅ PASS | Quantity updated to 3, line total 300 บาท, grand total correct. |
| **2) Merge Items Logic** | ✅ PASS | No duplicate rows, quantity merged 1 + 2 = 3, verified via DB query. |
| **3) Save for Later** | ✅ PASS | Item status changed to `SAVED`, removed from active totals, grand total drops to 0. |
| **Edge 1) Add More Than Stock** | ✅ PASS | Rejected with 409 (3 + 3 > 5), quantity remained at 3. |
| **Edge 2) Floating Point Calculation** | ✅ PASS | Integer cents arithmetic: 1999 × 3 = 5997 cents (59.97 บาท), no drift. |

---

## 2. Test Output

```text
 PASS  ./scenarios.test.js
  Shopping Cart Scenarios (SCCS01)
    ✓ Scenario 1: Update Item Quantity — เพิ่มจำนวนสินค้าในตะกร้า (189 ms)
    ✓ Scenario 2: Merge Items Logic — รวมรายการสินค้าซ้ำ (36 ms)
    ✓ Scenario 3: Save for Later — ย้ายสินค้าไปรายการ Saved (26 ms)
    ✓ Edge Case 1: Add More Than Stock — สินค้าไม่เพียงพอ (22 ms)
    ✓ Edge Case 2: Floating Point Calculation — 19.99 × 3 = 59.97 เป๋ะ (15 ms)

Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total
Snapshots:   0 total
Time:        0.64 s
Ran all test suites.
```

---

## 3. Code Implementation Details

### Backend: Database Schema (SQLAlchemy ORM — `backend/app/models.py`)

```python
class CartItemStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    SAVED  = "SAVED"

class Product(Base):
    __tablename__ = "products"
    id         : Mapped[int] = mapped_column(Integer, primary_key=True)
    sku        : Mapped[str] = mapped_column(String(64), unique=True, index=True)
    name       : Mapped[str] = mapped_column(String(200))
    price_cents: Mapped[int] = mapped_column(Integer)     # integer cents, no float
    stock_qty  : Mapped[int] = mapped_column(Integer)

class CartItem(Base):
    __tablename__ = "cart_items"
    __table_args__ = (UniqueConstraint("cart_id", "product_id", "status"),)

    id        : Mapped[int]            = mapped_column(Integer, primary_key=True)
    cart_id   : Mapped[str]            = mapped_column(ForeignKey("carts.id", ondelete="CASCADE"))
    product_id: Mapped[int]            = mapped_column(ForeignKey("products.id", ondelete="RESTRICT"))
    status    : Mapped[CartItemStatus] = mapped_column(Enum(CartItemStatus, name="cart_item_status"))
    quantity  : Mapped[int]            = mapped_column(Integer)
```

### Backend: Add to Cart / Merge Logic (`backend/app/main.py`)

Handles merging duplicate SKUs and enforcing the stock guard `(CurrentCartQty + NewQty) <= stock_qty`.

```python
@app.post("/api/carts/{cart_id}/items", response_model=CartOut)
def add_item(cart_id: str, body: AddItemIn, db: Session = Depends(get_db)):
    cart    = _get_cart_or_404(db, cart_id)
    product = db.execute(select(Product).where(Product.sku == body.sku)).scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Find existing ACTIVE row for same product (merge candidate)
    existing_active = next(
        (i for i in cart.items if i.product_id == product.id and i.status == CartItemStatus.ACTIVE),
        None,
    )

    # Inventory Guard: (CurrentCartQty + NewQty) <= stock_qty
    new_qty = body.quantity + (existing_active.quantity if existing_active else 0)
    if new_qty > product.stock_qty:
        raise HTTPException(status_code=409, detail="สินค้าไม่เพียงพอ")  # 409

    if existing_active:
        existing_active.quantity = new_qty   # Merge — no duplicate rows
    else:
        db.add(CartItem(cart_id=cart.id, product_id=product.id,
                        status=CartItemStatus.ACTIVE, quantity=body.quantity))
    db.commit()
    return cart_to_out(_get_cart_or_404(db, cart_id))
```

### Backend: Save for Later Logic (`backend/app/main.py`)

Flips a cart item's status from `ACTIVE` → `SAVED` atomically.

```python
@app.post("/api/carts/{cart_id}/items/{item_id}/save", response_model=CartOut)
def save_for_later(cart_id: str, item_id: int, db: Session = Depends(get_db)):
    cart = _get_cart_or_404(db, cart_id)
    item = next((i for i in cart.items if i.id == item_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    item.status = CartItemStatus.SAVED   # ACTIVE → SAVED
    db.commit()
    return cart_to_out(_get_cart_or_404(db, cart_id))
```

### Backend: Grand Total Calculation (`backend/app/logic.py`)

All arithmetic uses **integer cents** — no floating-point types are involved anywhere.

```python
def _cart_item_to_out(item) -> CartItemOut:
    return CartItemOut(
        ...
        line_total_cents = item.product.price_cents * item.quantity,  # integer × integer
    )

def cart_to_out(cart: Cart) -> CartOut:
    active_items      = [_cart_item_to_out(i) for i in active]
    grand_total_cents = sum(i.line_total_cents for i in active_items)  # exact integer sum
    return CartOut(..., grand_total_cents=grand_total_cents)
```

---

## 4. Test Script (`tests/scenarios.test.js`)

Integration tests run against the live Docker stack (`http://localhost:8000`), creating real carts and verifying responses + DB state.

```javascript
const api  = axios.create({ baseURL: "http://localhost:8000", validateStatus: () => true });
const pool = new Pool({ host: "127.0.0.1", port: 5432,
                        user: "postgres", password: "postgres", database: "cartdb" });

test("Scenario 2: Merge Items Logic", async () => {
  const cart = await createCart();
  await addItem(cart.id, "SKU-001", 1);        // first add

  const res = await addItem(cart.id, "SKU-001", 2);  // second add — must merge

  const sku001Items = res.data.active_items.filter(i => i.sku === "SKU-001");
  expect(sku001Items).toHaveLength(1);           // no duplicate rows
  expect(sku001Items[0].quantity).toBe(3);       // 1 + 2 merged

  // Verified in DB — only one cart_items row for this product
  const { rows } = await pool.query(
    `SELECT COUNT(*) AS cnt FROM cart_items ci
     JOIN products p ON p.id = ci.product_id WHERE p.sku = $1`, ["SKU-001"]
  );
  expect(parseInt(rows[0].cnt)).toBe(1);
});

test("Edge Case 2: Floating Point Calculation", async () => {
  const cart = await createCart();
  const res  = await addItem(cart.id, "SKU-01999", 3);  // 1999 cents × 3

  expect(res.data.active_items[0].line_total_cents).toBe(5997);  // 59.97 บาท exact
  expect(res.data.grand_total_cents).toBe(5997);
});
```

---

## 5. Key Differences vs SCCE01

| Aspect | SCCE01 (Node.js/Express) | SCCS01 (FastAPI/Python) |
|---|---|---|
| **Language / Framework** | Node.js + Express | Python + FastAPI + SQLAlchemy |
| **Cart identity** | Single `DEMO_CART_ID` (hardcoded UUID) | Dynamic UUID per `POST /api/carts` |
| **Merge lock** | `SELECT … FOR UPDATE` (raw SQL) | ORM-level in-memory merge within session |
| **Save for Later** | `POST /items/:sku/toggle-save` | `POST /carts/{id}/items/{item_id}/save` |
| **Response shape** | `{ cart: { items, totals } }` | `{ active_items, saved_items, grand_total_cents }` |
| **Insufficient stock code** | HTTP 409, `{ code: "INSUFFICIENT_STOCK" }` | HTTP 409, `{ detail: "สินค้าไม่เพียงพอ" }` |
| **Float product SKU** | SKU-006 (seeded via SQL) | SKU-01999 (seeded via `seed.py`) |
| **DB port (host)** | 5432 | 5432 (same) |
| **Test approach** | `supertest` (in-process) | `axios` + `pg` (integration against Docker) |

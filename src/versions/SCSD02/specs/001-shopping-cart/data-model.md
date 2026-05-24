# Data Model: Shopping Cart System

## Entity: Cart

Represents a shopper-owned shopping cart.

### Fields

- `id`: Unique cart identifier.
- `shopper_id`: Identifier for the shopper who owns the cart.
- `currency`: Currency code for all cart item prices. Defaults to `THB` for this
  feature.
- `created_at`: Timestamp when the cart was created.
- `updated_at`: Timestamp when the cart last changed.

### Relationships

- Has many `CartItem` records.

### Validation Rules

- A cart belongs to exactly one shopper.
- All cart item totals in a cart use the cart currency.

## Entity: CartItem

Represents a product entry in a cart.

### Fields

- `id`: Unique cart item identifier.
- `cart_id`: Parent cart identifier.
- `sku`: Product SKU.
- `name`: Display name for the product.
- `unit_price_minor`: Unit price in minor currency units.
- `quantity`: Positive integer quantity.
- `status`: `active` or `saved`.
- `line_total_minor`: Derived total, calculated as `unit_price_minor * quantity`.
- `created_at`: Timestamp when the item was added.
- `updated_at`: Timestamp when the item last changed.

### Relationships

- Belongs to one `Cart`.
- References one `ProductStock` record by SKU when validating stock.

### Validation Rules

- `quantity` must be greater than or equal to 1.
- `unit_price_minor` must be greater than or equal to 0.
- `status` must be either `active` or `saved`.
- Only one `active` item may exist for the same `cart_id` and `sku`.
- Saved items do not contribute to active cart totals.

### State Transitions

```text
active -> saved   when shopper selects "Save for Later"
saved  -> active  reserved for a future "Move to Cart" feature
active -> removed reserved for a future remove feature
```

## Entity: ProductStock

Represents available stock for a product SKU.

### Fields

- `sku`: Product SKU.
- `available_quantity`: Non-negative integer stock count.
- `updated_at`: Timestamp when stock was last refreshed.

### Relationships

- Provides validation input for `CartItem` quantity changes.

### Validation Rules

- `available_quantity` must be greater than or equal to 0.
- Requested active quantity for a SKU must not exceed `available_quantity`.

## Derived Views

### Active Cart View

- Includes only `CartItem` records with `status = active`.
- `grand_total_minor` is the sum of active item `line_total_minor`.
- `item_count` is the sum of active item quantities.

### Saved Items View

- Includes only `CartItem` records with `status = saved`.
- Saved items are shown separately and do not affect `grand_total_minor`.

## Persistence Constraints

- Unique active SKU constraint: one active row per `cart_id` and `sku`.
- Transactional cart mutations: stock validation and cart item mutation complete
  together or not at all.
- Monetary totals are calculated from integer minor units and formatted to two decimal
  places at response/display boundaries.

## Rollback And Recovery Guidance

- Migration rollback should drop the active SKU uniqueness constraint before dropping
  cart item status or cart tables.
- If a mutation fails stock validation, return the previous cart state and the
  user-facing message without writing partial changes.
- If a persistence error occurs after validation, roll back the transaction and return
  an unchanged cart state when available.

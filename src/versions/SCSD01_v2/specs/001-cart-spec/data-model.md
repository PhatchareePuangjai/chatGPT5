# Data Model: Shopping Cart Scenarios

**Feature**: /Users/phatchareepuangjai/Documents/chat_gsheet_logger_python/src/versions/SCSD01-v2/specs/001-cart-spec/spec.md
**Date**: 2026-04-05

## Entities

### Cart

- **Fields**:
  - `cart_id` (string)
  - `currency` (string, e.g., THB)
  - `items` (list of Cart Item)
  - `saved_items` (list of Saved Item)
- **Relationships**:
  - Contains many Cart Item entries and Saved Item entries.
- **Validation rules**:
  - `currency` is consistent across all items.

### Cart Item

- **Fields**:
  - `sku` (string)
  - `name` (string)
  - `unit_price_minor` (integer, minor units)
  - `quantity` (integer)
  - `line_total_minor` (integer, derived)
- **Relationships**:
  - Belongs to one Cart.
- **Validation rules**:
  - `quantity` must be >= 1.
  - `line_total_minor = unit_price_minor * quantity`.

### Saved Item

- **Fields**:
  - `sku` (string)
  - `name` (string)
  - `unit_price_minor` (integer, minor units)
  - `saved_at` (timestamp)
- **Relationships**:
  - Belongs to one Cart.
- **Validation rules**:
  - Saved items are excluded from cart totals.

### Product

- **Fields**:
  - `sku` (string)
  - `name` (string)
  - `unit_price_minor` (integer, minor units)
- **Relationships**:
  - Referenced by Cart Item and Saved Item.

### Inventory

- **Fields**:
  - `sku` (string)
  - `available_stock` (integer)
- **Relationships**:
  - Linked to Product by `sku`.
- **Validation rules**:
  - Combined cart quantity for a SKU cannot exceed `available_stock`.

## State Transitions

- **Active → Saved**: `Cart Item` becomes `Saved Item` when user selects
  "Save for Later". Item is removed from active cart list and excluded from
  totals.
- **Saved → Active** (future-ready): If an item is moved back to cart, it
  re-enters as a `Cart Item` and is counted in totals.

## Derived Data

- **Line Total**: `unit_price_minor * quantity`.
- **Cart Total**: Sum of `line_total_minor` across active Cart Items only.

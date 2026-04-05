# Contract: Cart Interface

**Feature**: /Users/phatchareepuangjai/Documents/chat_gsheet_logger_python/src/versions/SCSD01-v2/specs/001-cart-spec/spec.md
**Date**: 2026-04-05

## Overview

This contract defines the in-process API for cart behavior. It is intentionally
technology-agnostic and can be mapped to CLI, API, or UI later.

## Data Shapes

- **Money**: `{ amount_minor: integer, currency: string }`
- **CartItem**: `{ sku, name, unit_price_minor, quantity, line_total_minor }`
- **SavedItem**: `{ sku, name, unit_price_minor, saved_at }`
- **CartTotals**: `{ subtotal_minor, currency }`

## Operations

### Add Item

- **Input**: `sku`, `name`, `unit_price_minor`, `quantity` (positive integer)
- **Behavior**:
  - If item exists, merge quantities into a single line.
  - Validate `current_qty + quantity <= available_stock`.
- **Errors**:
  - `INSUFFICIENT_STOCK`: when requested quantity exceeds stock.

### Update Quantity

- **Input**: `sku`, `quantity` (positive integer)
- **Behavior**:
  - Updates quantity for existing item.
  - Recomputes line totals and cart totals.
- **Errors**:
  - `INSUFFICIENT_STOCK`: when updated quantity exceeds stock.
  - `ITEM_NOT_FOUND`: when SKU not present in active cart.

### Save for Later

- **Input**: `sku`
- **Behavior**:
  - Removes item from active cart list.
  - Adds item to saved list with timestamp.
  - Updates cart totals immediately.
- **Errors**:
  - `ITEM_NOT_FOUND`: when SKU not present in active cart.

### List Cart Items

- **Output**: List of `CartItem` entries (active only).

### List Saved Items

- **Output**: List of `SavedItem` entries.

### Get Totals

- **Output**: `CartTotals` for active cart items only.

## Non-Functional Guarantees

- Totals are computed in integer minor units and displayed to two decimals.
- All totals update synchronously for cart operations.

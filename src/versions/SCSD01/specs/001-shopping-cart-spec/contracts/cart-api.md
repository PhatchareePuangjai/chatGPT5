# Contract: Cart API (Library Interface)

**Date**: 2026-04-03

## Overview

The cart module exposes operations to manage items, enforce stock limits, and
compute totals with exact decimal display.

## Operations

### Add Item
- **Input**: sku, unit_price, quantity
- **Behavior**:
  - If sku exists, merge quantities into a single cart line.
  - Validate stock before applying the change.
- **Outputs**: Updated cart state or stock error.

### Update Quantity
- **Input**: sku, new_quantity
- **Behavior**:
  - Reject if stock would be exceeded.
  - Recalculate line and cart totals.
- **Outputs**: Updated cart state or stock error.

### Save for Later
- **Input**: sku
- **Behavior**:
  - Mark item as `SAVED` and exclude from active totals.
- **Outputs**: Updated cart state.

### Get Cart Summary
- **Input**: none
- **Behavior**:
  - Return active items, saved items, line totals, and cart total.
- **Outputs**: Cart summary with totals in two-decimal format.

## Errors

- **Stock Exceeded**: Returned when requested quantity exceeds available stock.
  Message: “สินค้าไม่เพียงพอ”

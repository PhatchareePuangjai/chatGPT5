# Contract: Cart UI (Front-End)

**Date**: 2026-04-03

## Overview

The UI provides a minimal cart view to exercise core behaviors without duplicate
rows, with clear totals and error feedback.

## UI Elements

- Cart line items list with SKU, unit price, quantity controls, line total
- Cart total summary
- “Save for Later” action per item
- Saved items list
- Stock warning message area

## UI Behaviors

- Quantity controls update line total and cart total immediately.
- Adding the same SKU merges into a single line with summed quantity.
- Stock violations surface the message “สินค้าไม่เพียงพอ” and keep prior quantity.
- Saving an item moves it to Saved Items and removes it from active totals.

## UI State Model

- Active items: included in totals and checkout list
- Saved items: excluded from totals, visible in saved list
- Error banner: shown when stock validation fails

# Quickstart: Shopping Cart Core Behaviors

**Date**: 2026-06-01  
**Spec**: specs/001-shopping-cart/spec.md  

This quickstart defines how to validate the feature end-to-end once implemented.
Commands are provided as a reference target for the implementation plan; adjust to
the repository's actual scripts as they are added.

## Prerequisites

- Local PostgreSQL instance available for development/testing
- A way to run backend and frontend locally (separate processes)

## Run Tests (Expected)

Backend (from `backend/`):
1. Install dependencies: `npm install`
2. Run tests: `npm test`

Frontend (from `frontend/`):
1. Install dependencies: `npm install`
2. Run tests: `npm test`

## Manual Validation Checklist

Use the acceptance scenarios from `spec.md` and validate:

1. Update item quantity recalculates totals correctly.
2. Add-to-cart for the same SKU merges into one line (no duplicates).
3. Stock enforcement rejects overstock attempts and preserves prior state with
   message "สินค้าไม่เพียงพอ".
4. Save for later moves item to saved list and reduces grand total.
5. Money precision: 19.99 * 3 displays as 59.97 exactly (no artifacts).

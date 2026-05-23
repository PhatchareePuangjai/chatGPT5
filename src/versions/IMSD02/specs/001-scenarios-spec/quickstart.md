# Quickstart: Inventory Stock Operations

**Date**: 2026-05-23
**Spec**: `specs/001-scenarios-spec/spec.md`
**Plan**: `specs/001-scenarios-spec/plan.md`

## Goal

Provide a minimal web application (API + UI) to exercise the inventory scenarios:

- Deduct stock on confirmed purchase
- Restore stock on cancel/expire
- Trigger low-stock alerts at the threshold boundary
- Prevent overselling under concurrent requests
- Ensure audit logs exist for every successful inventory change

## Artifacts

- Data model: `specs/001-scenarios-spec/data-model.md`
- API contracts: `specs/001-scenarios-spec/contracts/api.md`

## Acceptance Checks

1. Seed a SKU with `onHandQty=10`, confirm an order for quantity 2, and observe on-hand becomes 8 with an audit record.
2. Seed a SKU with `onHandQty=6` and `threshold=5`, confirm an order for quantity 2, and observe a low-stock alert is created/emitted.
3. Seed a SKU with `onHandQty=1`, run 5 concurrent confirmations, and observe exactly 1 succeeds, 4 fail, final on-hand is 0.
4. Simulate an audit logging failure during a stock update and observe the inventory change does not persist.

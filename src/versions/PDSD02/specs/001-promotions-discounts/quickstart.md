# Quickstart: Promotions and Discounts

**Feature**: `specs/001-promotions-discounts/spec.md`

This project uses a `backend/` + `frontend/` layout (see `specs/001-promotions-discounts/plan.md`).

## Local Development (expected)

Once code is implemented, the expected workflow is:

1. Configure environment:
   - `DATABASE_URL` for PostgreSQL
2. Run migrations
3. Start backend and frontend dev servers
4. Run tests (backend + frontend)

## Current Scaffold Notes

- Backend endpoints currently use demo cart subtotals (1,000 THB for apply-coupon, 2,000 THB for totals)
  to keep the scaffold runnable before cart storage is implemented.

## Test Scenarios

Use `scenarios_promotions.md` as the source of truth for acceptance scenarios and edge cases.

Key scenarios to verify:
- Apply "SAVE100" on 1,000 THB cart with min spend 500 THB -> 900 THB and success message.
- Apply expired coupon -> rejected, totals unchanged, "คูปองหมดอายุ".
- Apply 10% on 2,000 THB -> 200 THB discount, grand total 1,800 THB, clear discount line.
- One-time coupon reuse -> rejected, "คุณใช้สิทธิ์ครบแล้ว".
- Order of operations -> percent first then fixed to produce 800 THB from 1,000 THB with 10% + 100 THB.
- Negative total protection -> clamp to 0 THB.

# Quickstart: Promotions & Discounts

**Date**: 2026-05-31
**Spec**: `specs/001-promotions-discounts/spec.md`

This feature is currently specified and designed; implementation tasks are generated in the next step
via `/speckit-tasks`.

## What to Validate (Manual)

Use the acceptance scenarios in `specs/001-promotions-discounts/spec.md`:

- Apply `SAVE100` on a 1,000 THB cart → total becomes 900 THB and shows "ใช้คูปองสำเร็จ".
- Apply `EXPIRED` (expired yesterday) today → reject, totals unchanged, show "คูปองหมดอายุ".
- With 2,000 THB cart and 10% promo → discount 200 THB, grand total 1,800 THB with a separate line.
- Enforce `WELCOME` 1-use-per-user → second attempt rejected with "คุณใช้สิทธิ์ครบแล้ว".
- Combined 10% + 100 THB on 1,000 THB → total 800 THB using (percent then fixed).
- Prevent negative totals (e.g., 50 THB cart with 100 THB discount) → payable is 0 (or rejected per rule).

## What to Validate (Automated)

- Unit tests for pricing math (stacking order, rounding, non-negative totals).
- Integration tests for coupon eligibility (expiration, min spend, usage limit) using a real Postgres
  instance and seeded data.
- E2E tests for the checkout UI flows that display discount lines and messages.


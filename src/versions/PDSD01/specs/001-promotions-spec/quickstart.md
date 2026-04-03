# Quickstart: Promotions and Discounts

**Date**: 2026-04-03  
**Feature**: [spec.md](/Users/phatchareepuangjai/Documents/chat_gsheet_logger_python/src/versions/PDSD01/specs/001-promotions-spec/spec.md)

## Goal

Validate that coupon and promotion calculations behave correctly and display the
right totals and messages.

## Steps

1. Create a cart with subtotal 1,000 THB and apply coupon "SAVE100" with minimum
   spend 500 THB. Confirm total becomes 900 THB and a success message is shown.
2. Create a cart with subtotal 2,000 THB and apply a 10% cart promotion. Confirm
   discount is 200 THB and grand total is 1,800 THB with a line item displayed.
3. Apply an expired coupon "EXPIRED" and confirm rejection and unchanged total.
4. Apply a coupon with per-customer limit already used ("WELCOME") and confirm
   rejection and unchanged total.
5. Apply both a 10% discount and a 100 THB discount to a 1,000 THB cart and
   confirm the total is 800 THB with the correct order of operations.
6. Apply a 100 THB coupon to a 50 THB cart and confirm the total is clamped to 0
   THB.
7. Verify the checkout UI displays discount line items and messages for applied
   or rejected coupons.

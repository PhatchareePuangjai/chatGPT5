import { describe, expect, it } from 'vitest';
import { evaluateCouponEligibility } from '../../src/services/coupons/couponEligibility.js';
describe('evaluateCouponEligibility', () => {
    it('accepts when min spend met', () => {
        const result = evaluateCouponEligibility({
            coupon: {
                code: 'SAVE100',
                status: 'active',
                valid_until: null,
                min_spend_amount: 50_000,
                discount_type: 'fixed_amount',
                discount_value: 10_000,
                per_user_limit: null,
            },
            cartSubtotalAmount: 100_000,
            todayISODate: '2026-05-31',
        });
        expect(result).toEqual({ ok: true });
    });
    it('rejects when expired', () => {
        const result = evaluateCouponEligibility({
            coupon: {
                code: 'EXPIRED',
                status: 'active',
                valid_until: '2026-05-30',
                min_spend_amount: 0,
                discount_type: 'fixed_amount',
                discount_value: 10_000,
                per_user_limit: null,
            },
            cartSubtotalAmount: 100_000,
            todayISODate: '2026-05-31',
        });
        expect(result.ok).toBe(false);
        if (!result.ok)
            expect(result.code).toBe('COUPON_EXPIRED');
    });
});

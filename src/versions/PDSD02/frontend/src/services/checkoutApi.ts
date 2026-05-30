import { apiRequest } from './apiClient';
import type { ApplyCouponResponse, CheckoutTotalsResponse } from './checkoutTypes';

export function applyCoupon(cartId: string, couponCode: string): Promise<ApplyCouponResponse> {
  return apiRequest<ApplyCouponResponse>('/checkout/apply-coupon', {
    method: 'POST',
    body: JSON.stringify({ cartId, couponCode }),
  });
}

export function getTotals(cartId: string): Promise<CheckoutTotalsResponse> {
  return apiRequest<CheckoutTotalsResponse>(`/checkout/totals?cartId=${encodeURIComponent(cartId)}`);
}


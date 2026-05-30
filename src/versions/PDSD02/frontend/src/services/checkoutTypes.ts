export type DiscountLine = {
  type: 'COUPON' | 'PROMOTION';
  label: string;
  amountSatang: number;
  order: number;
};

export type Totals = {
  currency: 'THB';
  subtotalSatang: number;
  discountTotalSatang: number;
  grandTotalSatang: number;
};

export type CheckoutTotalsResponse = {
  totals: Totals;
  discountLines: DiscountLine[];
};

export type ApplyCouponResponse = CheckoutTotalsResponse & {
  coupon?: { code: string; status: 'APPLIED' | 'REJECTED' };
  message?: string;
};


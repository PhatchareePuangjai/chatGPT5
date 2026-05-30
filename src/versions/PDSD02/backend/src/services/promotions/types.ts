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

export type Promotion = {
  id: string;
  name: string;
  percentBasisPoints: number;
  isActive: boolean;
};

export type Coupon = {
  id: string;
  code: string;
  amountSatang: number;
  minSpendSatang: number;
  expiresAt?: Date;
  usageLimitPerUser?: number;
  isActive: boolean;
};

export type CartSnapshot = {
  cartId: string;
  userId: string;
  currency: 'THB';
  subtotalSatang: number;
};

export type ApplyCouponResult = {
  coupon?: { code: string; status: 'APPLIED' | 'REJECTED' };
  message?: string;
  totals: Totals;
  discountLines: DiscountLine[];
};


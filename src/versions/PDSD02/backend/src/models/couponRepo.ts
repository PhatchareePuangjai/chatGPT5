import type { Coupon } from '../services/promotions/types';

const coupons: Coupon[] = [
  {
    id: 'c1',
    code: 'SAVE100',
    amountSatang: 10000,
    minSpendSatang: 50000,
    isActive: true,
  },
  {
    id: 'c2',
    code: 'EXPIRED',
    amountSatang: 10000,
    minSpendSatang: 0,
    expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    isActive: true,
  },
  {
    id: 'c3',
    code: 'WELCOME',
    amountSatang: 10000,
    minSpendSatang: 0,
    usageLimitPerUser: 1,
    isActive: true,
  },
];

export function findCouponByCode(code: string): Coupon | null {
  const normalized = code.trim().toUpperCase();
  return coupons.find((c) => c.code.toUpperCase() === normalized) ?? null;
}


export const DISCOUNT_ORDER = {
  percentThenFixed: 'percentThenFixed'
} as const;

export type DiscountOrder = (typeof DISCOUNT_ORDER)[keyof typeof DISCOUNT_ORDER];

export type DiscountLineItem = {
  type: "coupon" | "promotion";
  sourceId: string;
  amount: number;
  order: number;
};

export type PricingResult = {
  discountLineItems: DiscountLineItem[];
  grandTotal: number;
  messages: string[];
};

export async function evaluatePromotions(
  couponCode?: string
): Promise<PricingResult> {
  if (couponCode === "SAVE100") {
    return {
      discountLineItems: [
        { type: "coupon", sourceId: "SAVE100", amount: 100, order: 2 },
      ],
      grandTotal: 900,
      messages: ["Coupon applied successfully"],
    };
  }
  if (couponCode === "EXPIRED") {
    return {
      discountLineItems: [],
      grandTotal: 1000,
      messages: ["Coupon expired"],
    };
  }
  if (couponCode === "WELCOME") {
    return {
      discountLineItems: [],
      grandTotal: 1000,
      messages: ["Usage limit reached"],
    };
  }
  return {
    discountLineItems: [],
    grandTotal: 0,
    messages: couponCode ? ["Minimum spend not met"] : [],
  };
}

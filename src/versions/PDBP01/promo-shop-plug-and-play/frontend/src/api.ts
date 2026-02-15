export type Product = { id: string; name: string; price_satang: number; stock: number };
export type CartItem = { productId: string; qty: number };

export type QuoteResponse = {
  ok: boolean;
  errors: string[];
  messages: string[];
  userId: string;
  items: Array<{
    productId: string;
    name: string;
    price_satang: number;
    qty: number;
    stock: number;
    line_total_satang: number;
  }>;
  couponCode: string | null;
  appliedCoupon: null | {
    code: string;
    amount_satang: number;
    min_subtotal_satang: number;
    expires_at: string;
    per_user_limit: number | null;
  };
  pricing: {
    subtotal_satang: number;
    auto_discount_satang: number;
    subtotal_after_auto_satang: number;
    coupon_discount_satang: number;
    total_satang: number;
  };
};

export async function getProducts(): Promise<Product[]> {
  const res = await fetch("/api/products");
  const json = await res.json();
  return json.products as Product[];
}

async function postJson<T>(url: string, payload: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  return json as T;
}

export function quote(payload: { userId: string; items: CartItem[]; couponCode?: string }) {
  return postJson<QuoteResponse>("/api/checkout/quote", payload);
}

export function confirm(payload: { userId: string; items: CartItem[]; couponCode?: string }) {
  return postJson<QuoteResponse>("/api/checkout/confirm", payload);
}

export function formatBaht(satang: number): string {
  return (satang / 100).toFixed(2);
}

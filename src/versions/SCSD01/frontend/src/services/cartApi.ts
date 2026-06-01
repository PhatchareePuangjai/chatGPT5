export type CartItem = {
  sku: string;
  status: 'ACTIVE' | 'SAVED';
  quantity: number;
  unit_price_minor: number;
  line_total_minor: number;
};

export type CartView = {
  items_active: CartItem[];
  items_saved: CartItem[];
  grand_total_minor: number;
};

function baseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001';
}

function getCartId(): string {
  // For now, create a stable demo cart id on first load.
  // In a real app, this would come from session/auth.
  const existing = localStorage.getItem('cartId');
  if (existing) return existing;
  const created =
    (typeof crypto !== 'undefined' && 'randomUUID' in crypto && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `cart-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  localStorage.setItem('cartId', created);
  return created;
}

export async function getCart(): Promise<CartView> {
  const res = await fetch(`${baseUrl()}/cart`, { headers: { 'x-cart-id': getCartId() } });
  if (!res.ok) throw new Error('Failed to load cart');
  return res.json();
}

export async function patchQuantity(sku: string, quantity: number): Promise<CartView> {
  const res = await fetch(`${baseUrl()}/cart/items/${encodeURIComponent(sku)}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json', 'x-cart-id': getCartId() },
    body: JSON.stringify({ quantity })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message ?? 'Failed to update quantity');
  return data;
}

export async function addToCart(sku: string, quantity: number, unit_price_minor: number): Promise<CartView> {
  const res = await fetch(`${baseUrl()}/cart/items`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-cart-id': getCartId() },
    body: JSON.stringify({ sku, quantity, unit_price_minor })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message ?? 'Failed to add to cart');
  return data;
}

export async function saveForLater(sku: string): Promise<CartView> {
  const res = await fetch(`${baseUrl()}/cart/items/${encodeURIComponent(sku)}/save`, {
    method: 'POST',
    headers: { 'x-cart-id': getCartId() }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message ?? 'Failed to save for later');
  return data;
}

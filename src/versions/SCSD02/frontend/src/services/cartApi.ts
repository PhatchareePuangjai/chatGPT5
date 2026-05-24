import { httpJson, type HttpError } from './http';

export type CartItem = {
  sku: string;
  unit_price_minor: number;
  unit_price_display: string;
  qty: number;
  line_total_minor: number;
  line_total_display: string;
};

export type SavedItem = { sku: string };

export type Cart = {
  cart_id: string;
  currency: string;
  active_items: CartItem[];
  saved_items: SavedItem[];
  grand_total_minor: number;
  grand_total_display: string;
};

export type CartApi = {
  getCart(): Promise<Cart>;
  addItem(params: { sku: string; qty: number }): Promise<Cart>;
  setQty(params: { sku: string; qty: number }): Promise<Cart>;
  saveForLater(params: { sku: string }): Promise<Cart>;
};

export type CartApiFactoryParams = {
  baseUrl: string;
};

export function makeCartApi(params: CartApiFactoryParams): CartApi {
  const base = params.baseUrl.replace(/\/+$/, '');
  return {
    async getCart() {
      return httpJson<Cart>(`${base}/cart`);
    },
    async addItem(body) {
      return httpJson<Cart>(`${base}/cart/items`, { method: 'POST', body: JSON.stringify(body) });
    },
    async setQty({ sku, qty }) {
      return httpJson<Cart>(`${base}/cart/items/${encodeURIComponent(sku)}`, {
        method: 'PATCH',
        body: JSON.stringify({ qty }),
      });
    },
    async saveForLater({ sku }) {
      return httpJson<Cart>(`${base}/cart/items/${encodeURIComponent(sku)}/save`, { method: 'POST' });
    },
  };
}

export function isInsufficientStock(err: unknown): boolean {
  const e = err as Partial<HttpError>;
  return e?.code === 'INSUFFICIENT_STOCK';
}


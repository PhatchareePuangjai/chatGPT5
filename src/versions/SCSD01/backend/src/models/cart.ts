import type { CartItem } from './cartItem.js';

export type Cart = {
  id: string;
  shopper_id: string;
};

export type CartView = {
  items_active: CartItem[];
  items_saved: CartItem[];
  grand_total_minor: number;
};


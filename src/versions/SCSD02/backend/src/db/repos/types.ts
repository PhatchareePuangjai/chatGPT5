import type { MoneyMinor } from '../../domain/money.js';

export type CartItemRow = {
  sku: string;
  qty: number;
  unitPriceMinor: MoneyMinor;
};

export type SavedItemRow = {
  sku: string;
};

export type CartSnapshot = {
  cartId: string;
  currency: string;
  activeItems: CartItemRow[];
  savedItems: SavedItemRow[];
};


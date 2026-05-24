import { computeCartTotals } from '../domain/cartTotals.js';
import { formatMoneyMinor, type MoneyMinor } from '../domain/money.js';
import { assertWithinStock } from '../domain/stock.js';
import type { CartRepo } from '../db/repos/cartRepo.js';
import type { ProductRepo } from '../db/repos/productRepo.js';

export type CartItemResponse = {
  sku: string;
  unit_price_minor: number;
  unit_price_display: string;
  qty: number;
  line_total_minor: number;
  line_total_display: string;
};

export type SavedItemResponse = { sku: string };

export type CartResponse = {
  cart_id: string;
  currency: string;
  active_items: CartItemResponse[];
  saved_items: SavedItemResponse[];
  grand_total_minor: number;
  grand_total_display: string;
};

function toCartResponse(params: {
  cartId: string;
  currency: string;
  active: { sku: string; qty: number; unitPriceMinor: MoneyMinor }[];
  saved: { sku: string }[];
}): CartResponse {
  const totals = computeCartTotals(
    params.active.map((a) => ({ sku: a.sku, qty: a.qty, unitPriceMinor: a.unitPriceMinor })),
  );
  return {
    cart_id: params.cartId,
    currency: params.currency,
    active_items: totals.items.map((it) => ({
      sku: it.sku,
      unit_price_minor: it.unitPriceMinor,
      unit_price_display: formatMoneyMinor(it.unitPriceMinor),
      qty: it.qty,
      line_total_minor: it.lineTotalMinor,
      line_total_display: formatMoneyMinor(it.lineTotalMinor),
    })),
    saved_items: params.saved.map((s) => ({ sku: s.sku })),
    grand_total_minor: totals.grandTotalMinor,
    grand_total_display: formatMoneyMinor(totals.grandTotalMinor),
  };
}

export class CartService {
  constructor(
    private deps: {
      cartRepo: CartRepo;
      productRepo: ProductRepo;
    },
  ) {}

  async getCart(cartId: string): Promise<CartResponse> {
    const snap = await this.deps.cartRepo.getCart(cartId);
    return toCartResponse({
      cartId: snap.cartId,
      currency: snap.currency,
      active: snap.activeItems,
      saved: snap.savedItems,
    });
  }

  async setItemQty(params: { cartId: string; sku: string; qty: number }): Promise<CartResponse> {
    const { cartId, sku, qty } = params;
    const existing = await this.deps.cartRepo.getActiveItem(cartId, sku);
    if (!existing) {
      const err = new Error('Not found');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (err as any).code = 'NOT_FOUND';
      throw err;
    }
    const info = await this.deps.productRepo.getProductInfo(sku);
    if (!info) {
      const err = new Error('Not found');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (err as any).code = 'NOT_FOUND';
      throw err;
    }
    // For set qty, requestedAdditionalQty is the new qty (full value) against stock.
    assertWithinStock({ currentCartQty: 0, requestedAdditionalQty: qty, availableStockQty: info.availableStockQty });

    await this.deps.cartRepo.upsertActiveItem(cartId, { sku, qty, unitPriceMinor: existing.unitPriceMinor });
    return this.getCart(cartId);
  }

  async addItem(params: { cartId: string; sku: string; qty: number }): Promise<CartResponse> {
    const { cartId, sku, qty } = params;
    const info = await this.deps.productRepo.getProductInfo(sku);
    if (!info) {
      const err = new Error('Not found');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (err as any).code = 'NOT_FOUND';
      throw err;
    }
    const existing = await this.deps.cartRepo.getActiveItem(cartId, sku);
    const currentQty = existing?.qty ?? 0;
    assertWithinStock({ currentCartQty: currentQty, requestedAdditionalQty: qty, availableStockQty: info.availableStockQty });
    const newQty = currentQty + qty;
    await this.deps.cartRepo.upsertActiveItem(cartId, { sku, qty: newQty, unitPriceMinor: info.unitPriceMinor });
    return this.getCart(cartId);
  }

  async saveForLater(params: { cartId: string; sku: string }): Promise<CartResponse> {
    const { cartId, sku } = params;
    const existing = await this.deps.cartRepo.getActiveItem(cartId, sku);
    if (!existing) {
      const err = new Error('Not found');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (err as any).code = 'NOT_FOUND';
      throw err;
    }
    await this.deps.cartRepo.addSavedItem(cartId, { sku });
    return this.getCart(cartId);
  }
}


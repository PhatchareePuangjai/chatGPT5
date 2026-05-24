import type { CartItemRow, CartSnapshot, SavedItemRow } from './types.js';
import type pg from 'pg';

export interface CartRepo {
  getCart(cartId: string): Promise<CartSnapshot>;
  getActiveItem(cartId: string, sku: string): Promise<CartItemRow | null>;
  upsertActiveItem(cartId: string, item: CartItemRow): Promise<void>;
  removeActiveItem(cartId: string, sku: string): Promise<void>;
  addSavedItem(cartId: string, item: SavedItemRow): Promise<void>;
  removeSavedItem(cartId: string, sku: string): Promise<void>;
}

export class PgCartRepo implements CartRepo {
  constructor(private pool: pg.Pool) {}

  async getCart(cartId: string): Promise<CartSnapshot> {
    // Note: This assumes `carts` row exists; for simplicity we default currency if missing.
    const cartRes = await this.pool.query<{ currency: string }>(
      'SELECT currency FROM carts WHERE cart_id = $1',
      [cartId],
    );
    const currency = cartRes.rows[0]?.currency ?? 'THB';

    const activeRes = await this.pool.query<{
      sku: string;
      qty: number;
      unit_price_minor: number;
    }>('SELECT sku, qty, unit_price_minor FROM cart_items WHERE cart_id = $1', [cartId]);

    const savedRes = await this.pool.query<{ sku: string }>(
      'SELECT sku FROM saved_items WHERE cart_id = $1',
      [cartId],
    );

    return {
      cartId,
      currency,
      activeItems: activeRes.rows.map((r) => ({
        sku: r.sku,
        qty: r.qty,
        unitPriceMinor: r.unit_price_minor,
      })),
      savedItems: savedRes.rows.map((r) => ({ sku: r.sku })),
    };
  }

  async getActiveItem(cartId: string, sku: string): Promise<CartItemRow | null> {
    const res = await this.pool.query<{
      sku: string;
      qty: number;
      unit_price_minor: number;
    }>('SELECT sku, qty, unit_price_minor FROM cart_items WHERE cart_id = $1 AND sku = $2', [
      cartId,
      sku,
    ]);
    const row = res.rows[0];
    if (!row) return null;
    return { sku: row.sku, qty: row.qty, unitPriceMinor: row.unit_price_minor };
  }

  async upsertActiveItem(cartId: string, item: CartItemRow): Promise<void> {
    await this.pool.query(
      `INSERT INTO cart_items (cart_id, sku, qty, unit_price_minor)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (cart_id, sku)
       DO UPDATE SET qty = EXCLUDED.qty, unit_price_minor = EXCLUDED.unit_price_minor, updated_at = NOW()`,
      [cartId, item.sku, item.qty, item.unitPriceMinor],
    );
    // Default assumption: saving is a move; avoid duplicates.
    await this.pool.query('DELETE FROM saved_items WHERE cart_id = $1 AND sku = $2', [cartId, item.sku]);
  }

  async removeActiveItem(cartId: string, sku: string): Promise<void> {
    await this.pool.query('DELETE FROM cart_items WHERE cart_id = $1 AND sku = $2', [cartId, sku]);
  }

  async addSavedItem(cartId: string, item: SavedItemRow): Promise<void> {
    await this.pool.query(
      `INSERT INTO saved_items (cart_id, sku)
       VALUES ($1, $2)
       ON CONFLICT (cart_id, sku) DO NOTHING`,
      [cartId, item.sku],
    );
    // Default assumption: saving is a move; avoid duplicates.
    await this.pool.query('DELETE FROM cart_items WHERE cart_id = $1 AND sku = $2', [cartId, item.sku]);
  }

  async removeSavedItem(cartId: string, sku: string): Promise<void> {
    await this.pool.query('DELETE FROM saved_items WHERE cart_id = $1 AND sku = $2', [cartId, sku]);
  }
}

// Minimal in-memory repo for tests and local dev without Postgres.
export class InMemoryCartRepo implements CartRepo {
  private carts = new Map<
    string,
    { currency: string; active: Map<string, CartItemRow>; saved: Map<string, SavedItemRow> }
  >();

  constructor(private opts?: { currency?: string }) {}

  private ensure(cartId: string) {
    let c = this.carts.get(cartId);
    if (!c) {
      c = { currency: this.opts?.currency ?? 'THB', active: new Map(), saved: new Map() };
      this.carts.set(cartId, c);
    }
    return c;
  }

  async getCart(cartId: string): Promise<CartSnapshot> {
    const c = this.ensure(cartId);
    return {
      cartId,
      currency: c.currency,
      activeItems: [...c.active.values()],
      savedItems: [...c.saved.values()],
    };
  }

  async getActiveItem(cartId: string, sku: string): Promise<CartItemRow | null> {
    const c = this.ensure(cartId);
    return c.active.get(sku) ?? null;
  }

  async upsertActiveItem(cartId: string, item: CartItemRow): Promise<void> {
    const c = this.ensure(cartId);
    c.active.set(item.sku, item);
    // Default assumption: saving is a move; avoid duplicates.
    c.saved.delete(item.sku);
  }

  async removeActiveItem(cartId: string, sku: string): Promise<void> {
    const c = this.ensure(cartId);
    c.active.delete(sku);
  }

  async addSavedItem(cartId: string, item: SavedItemRow): Promise<void> {
    const c = this.ensure(cartId);
    c.saved.set(item.sku, item);
    // Default assumption: saving is a move; avoid duplicates.
    c.active.delete(item.sku);
  }

  async removeSavedItem(cartId: string, sku: string): Promise<void> {
    const c = this.ensure(cartId);
    c.saved.delete(sku);
  }
}

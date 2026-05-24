import type { MoneyMinor } from '../../domain/money.js';
import type pg from 'pg';

export type ProductInfo = {
  sku: string;
  unitPriceMinor: MoneyMinor;
  availableStockQty: number;
};

export interface ProductRepo {
  getProductInfo(sku: string): Promise<ProductInfo | null>;
}

export class PgProductRepo implements ProductRepo {
  constructor(private pool: pg.Pool) {}

  async getProductInfo(sku: string): Promise<ProductInfo | null> {
    const res = await this.pool.query<{
      sku: string;
      unit_price_minor: number;
      available_qty: number;
    }>(
      `SELECT p.sku, p.unit_price_minor, i.available_qty
       FROM products p
       JOIN inventory i ON i.sku = p.sku
       WHERE p.sku = $1`,
      [sku],
    );
    const row = res.rows[0];
    if (!row) return null;
    return { sku: row.sku, unitPriceMinor: row.unit_price_minor, availableStockQty: row.available_qty };
  }
}

// Minimal in-memory product store for tests/dev.
export class InMemoryProductRepo implements ProductRepo {
  private products = new Map<string, ProductInfo>();

  constructor(seed?: ProductInfo[]) {
    seed?.forEach((p) => this.products.set(p.sku, p));
  }

  async getProductInfo(sku: string): Promise<ProductInfo | null> {
    return this.products.get(sku) ?? null;
  }

  upsert(p: ProductInfo) {
    this.products.set(p.sku, p);
  }
}

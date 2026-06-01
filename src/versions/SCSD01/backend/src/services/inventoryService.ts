import { withClient } from '../lib/db.js';

export async function getStockBySku(sku: string): Promise<number> {
  return withClient(async (client) => {
    const res = await client.query('SELECT available_quantity FROM inventory_items WHERE sku = $1', [sku]);
    if (res.rowCount === 0) return 0;
    return Number(res.rows[0].available_quantity);
  });
}


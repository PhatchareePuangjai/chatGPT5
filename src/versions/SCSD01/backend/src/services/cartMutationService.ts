import { randomUUID } from 'node:crypto';
import { withTransaction } from '../lib/db.js';
import { multiplyMinor } from '../lib/money.js';
import { insufficientStock, notFound } from '../api/errors.js';
import { getStockBySku } from './inventoryService.js';

async function getActiveCartQty(client: any, cartId: string, sku: string): Promise<number> {
  const res = await client.query(
    "SELECT quantity FROM cart_items WHERE cart_id = $1 AND sku = $2 AND status = 'ACTIVE' LIMIT 1",
    [cartId, sku]
  );
  if (res.rowCount === 0) return 0;
  return Number(res.rows[0].quantity);
}

export async function setItemQuantity(args: {
  cartId: string;
  sku: string;
  quantity: number;
}): Promise<void> {
  const { cartId, sku, quantity } = args;
  if (!Number.isInteger(quantity) || quantity < 0) {
    throw new Error('quantity must be integer >= 0');
  }

  await withTransaction(async (client) => {
    const res = await client.query(
      "SELECT id, unit_price_minor FROM cart_items WHERE cart_id = $1 AND sku = $2 AND status = 'ACTIVE' LIMIT 1",
      [cartId, sku]
    );
    if (res.rowCount === 0) throw notFound(`No active cart item for sku ${sku}`, { cartId, sku });

    const unitPriceMinor = Number(res.rows[0].unit_price_minor);
    const stock = await getStockBySku(sku);
    if (quantity > stock) throw insufficientStock({ cartId, sku, requested: quantity, stock });

    const lineTotalMinor = multiplyMinor(unitPriceMinor, quantity);
    await client.query(
      "UPDATE cart_items SET quantity = $1, line_total_minor = $2, updated_at = NOW() WHERE id = $3",
      [quantity, lineTotalMinor, res.rows[0].id]
    );
  });
}

export async function addItem(args: { cartId: string; sku: string; quantity: number; unitPriceMinor: number }): Promise<void> {
  const { cartId, sku, quantity, unitPriceMinor } = args;
  if (!Number.isInteger(quantity) || quantity <= 0) throw new Error('quantity must be integer > 0');
  if (!Number.isInteger(unitPriceMinor) || unitPriceMinor < 0) throw new Error('unitPriceMinor must be integer >= 0');

  await withTransaction(async (client) => {
    const res = await client.query(
      "SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND sku = $2 AND status = 'ACTIVE' LIMIT 1",
      [cartId, sku]
    );
    const currentQty = res.rowCount ? Number(res.rows[0].quantity) : 0;
    const mergedQty = currentQty + quantity;

    const stock = await getStockBySku(sku);
    if (mergedQty > stock) throw insufficientStock({ cartId, sku, requested_add: quantity, current: currentQty, stock });

    const lineTotalMinor = multiplyMinor(unitPriceMinor, mergedQty);

    if (res.rowCount) {
      await client.query(
        "UPDATE cart_items SET quantity = $1, line_total_minor = $2, updated_at = NOW() WHERE id = $3",
        [mergedQty, lineTotalMinor, res.rows[0].id]
      );
    } else {
      await client.query(
        "INSERT INTO cart_items (id, cart_id, sku, status, quantity, unit_price_minor, line_total_minor) VALUES ($1, $2, $3, 'ACTIVE', $4, $5, $6)",
        [randomUUID(), cartId, sku, mergedQty, unitPriceMinor, lineTotalMinor]
      );
    }
  });
}

export async function saveForLater(args: { cartId: string; sku: string }): Promise<void> {
  const { cartId, sku } = args;
  await withTransaction(async (client) => {
    const res = await client.query(
      "SELECT id FROM cart_items WHERE cart_id = $1 AND sku = $2 AND status = 'ACTIVE' LIMIT 1",
      [cartId, sku]
    );
    if (res.rowCount === 0) throw notFound(`No active cart item for sku ${sku}`, { cartId, sku });
    await client.query("UPDATE cart_items SET status = 'SAVED', updated_at = NOW() WHERE id = $1", [res.rows[0].id]);
  });
}


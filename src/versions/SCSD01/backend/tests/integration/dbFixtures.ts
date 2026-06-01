import { randomUUID } from 'node:crypto';
import { withClient } from '../../src/lib/db.js';
import { multiplyMinor } from '../../src/lib/money.js';

export async function seedCart(args: { shopperId?: string } = {}): Promise<{ cartId: string }> {
  const cartId = randomUUID();
  const shopperId = args.shopperId ?? 'shopper-1';
  await withClient(async (client) => {
    await client.query('INSERT INTO carts (id, shopper_id) VALUES ($1, $2)', [cartId, shopperId]);
  });
  return { cartId };
}

export async function seedInventory(args: { sku: string; availableQty: number }): Promise<void> {
  await withClient(async (client) => {
    await client.query(
      'INSERT INTO inventory_items (sku, available_quantity) VALUES ($1, $2) ON CONFLICT (sku) DO UPDATE SET available_quantity = EXCLUDED.available_quantity, updated_at = NOW()',
      [args.sku, args.availableQty]
    );
  });
}

export async function seedCartItem(args: {
  cartId: string;
  sku: string;
  status: 'ACTIVE' | 'SAVED';
  quantity: number;
  unitPriceMinor: number;
}): Promise<void> {
  await withClient(async (client) => {
    const id = randomUUID();
    const lineTotalMinor = multiplyMinor(args.unitPriceMinor, args.quantity);
    await client.query(
      'INSERT INTO cart_items (id, cart_id, sku, status, quantity, unit_price_minor, line_total_minor) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      [id, args.cartId, args.sku, args.status, args.quantity, args.unitPriceMinor, lineTotalMinor]
    );
  });
}


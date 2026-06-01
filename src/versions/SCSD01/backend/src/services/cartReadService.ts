import type { CartItem } from '../models/cartItem.js';
import type { CartView } from '../models/cart.js';
import { sumMinor } from '../lib/money.js';
import { withClient } from '../lib/db.js';

function partition(items: CartItem[]): { active: CartItem[]; saved: CartItem[] } {
  const active: CartItem[] = [];
  const saved: CartItem[] = [];
  for (const item of items) {
    if (item.status === 'ACTIVE') active.push(item);
    else saved.push(item);
  }
  return { active, saved };
}

export async function getCart(cartId: string): Promise<CartView> {
  return withClient(async (client) => {
    const res = await client.query(
      'SELECT id, cart_id, sku, status, quantity, unit_price_minor, line_total_minor FROM cart_items WHERE cart_id = $1 ORDER BY created_at ASC',
      [cartId]
    );
    const items: CartItem[] = res.rows.map((r) => ({
      id: r.id,
      cart_id: r.cart_id,
      sku: r.sku,
      status: r.status,
      quantity: Number(r.quantity),
      unit_price_minor: Number(r.unit_price_minor),
      line_total_minor: Number(r.line_total_minor)
    }));
    const { active, saved } = partition(items);
    const grand_total_minor = sumMinor(active.map((i) => i.line_total_minor));
    return { items_active: active, items_saved: saved, grand_total_minor };
  });
}


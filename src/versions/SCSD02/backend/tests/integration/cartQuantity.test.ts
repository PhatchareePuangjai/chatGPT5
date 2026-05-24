import { describe, expect, it } from 'vitest';
import { makeApp } from '../../src/index.js';

describe('cartService.setItemQty (integration)', () => {
  it('updates quantity and totals', async () => {
    const { deps } = makeApp();

    // Seed an active cart item "A" unitPrice 100.00 (10000 minor) qty 1
    await deps.cartRepo.upsertActiveItem('default', { sku: 'A', qty: 1, unitPriceMinor: 10000 });
    deps.productRepo.upsert({ sku: 'A', unitPriceMinor: 10000, availableStockQty: 99 });

    const cart = await deps.cartService.setItemQty({ cartId: 'default', sku: 'A', qty: 3 });
    expect(cart.active_items).toHaveLength(1);
    expect(cart.active_items[0].qty).toBe(3);
    expect(cart.active_items[0].line_total_display).toBe('300.00');
    expect(cart.grand_total_display).toBe('300.00');
  });
});

import { describe, expect, it } from 'vitest';
import { makeApp } from '../../src/index.js';

describe('cartService.addItem stock enforcement (integration)', () => {
  it('rejects when total qty would exceed stock and keeps cart unchanged', async () => {
    const { deps } = makeApp();
    deps.productRepo.upsert({ sku: 'SKU-LOW', unitPriceMinor: 10000, availableStockQty: 5 });

    // Seed cart at qty 3
    await deps.cartRepo.upsertActiveItem('default', { sku: 'SKU-LOW', qty: 3, unitPriceMinor: 10000 });

    await expect(
      deps.cartService.addItem({ cartId: 'default', sku: 'SKU-LOW', qty: 3 }),
    ).rejects.toMatchObject({ message: 'Insufficient stock' });

    const cart = await deps.cartService.getCart('default');
    expect(cart.active_items).toHaveLength(1);
    expect(cart.active_items[0].qty).toBe(3);
  });
});


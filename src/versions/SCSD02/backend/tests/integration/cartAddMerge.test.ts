import { describe, expect, it } from 'vitest';
import { makeApp } from '../../src/index.js';

describe('cartService.addItem (integration)', () => {
  it('merges add-to-cart into existing active row', async () => {
    const { deps } = makeApp();
    deps.productRepo.upsert({ sku: 'SKU-001', unitPriceMinor: 10000, availableStockQty: 10 });

    await deps.cartService.addItem({ cartId: 'default', sku: 'SKU-001', qty: 1 });
    const afterSecond = await deps.cartService.addItem({ cartId: 'default', sku: 'SKU-001', qty: 2 });

    expect(afterSecond.active_items).toHaveLength(1);
    expect(afterSecond.active_items[0].sku).toBe('SKU-001');
    expect(afterSecond.active_items[0].qty).toBe(3);
  });
});


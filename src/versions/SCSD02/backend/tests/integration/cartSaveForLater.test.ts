import { describe, expect, it } from 'vitest';
import { makeApp } from '../../src/index.js';

describe('cartService.saveForLater (integration)', () => {
  it('moves an active item to saved items and updates totals', async () => {
    const { deps } = makeApp();
    deps.productRepo.upsert({ sku: 'SKU-005', unitPriceMinor: 5000, availableStockQty: 10 });

    await deps.cartService.addItem({ cartId: 'default', sku: 'SKU-005', qty: 2 });
    const before = await deps.cartService.getCart('default');
    expect(before.active_items).toHaveLength(1);
    expect(before.saved_items).toHaveLength(0);
    expect(before.grand_total_display).toBe('100.00');

    const after = await deps.cartService.saveForLater({ cartId: 'default', sku: 'SKU-005' });
    expect(after.active_items).toHaveLength(0);
    expect(after.saved_items).toHaveLength(1);
    expect(after.saved_items[0].sku).toBe('SKU-005');
    expect(after.grand_total_display).toBe('0.00');
  });
});


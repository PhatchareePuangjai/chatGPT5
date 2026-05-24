import { describe, expect, it } from 'vitest';
import { makeApp } from '../../src/index.js';

describe('cartService.getCart (contract sanity)', () => {
  it('returns a cart with required fields', async () => {
    const { deps } = makeApp();
    const cart = await deps.cartService.getCart('default');
    expect(cart).toHaveProperty('cart_id');
    expect(cart).toHaveProperty('currency');
    expect(cart).toHaveProperty('active_items');
    expect(cart).toHaveProperty('saved_items');
    expect(cart).toHaveProperty('grand_total_minor');
    expect(cart).toHaveProperty('grand_total_display');
  });
});


import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CartProvider } from '../src/state/cartStore';
import { CartPage } from '../src/pages/CartPage';
import type { Cart, CartApi } from '../src/services/cartApi';

function makeCart(overrides?: Partial<Cart>): Cart {
  return {
    cart_id: 'default',
    currency: 'THB',
    active_items: [
      {
        sku: 'SKU-005',
        unit_price_minor: 5000,
        unit_price_display: '50.00',
        qty: 2,
        line_total_minor: 10000,
        line_total_display: '100.00',
      },
    ],
    saved_items: [],
    grand_total_minor: 10000,
    grand_total_display: '100.00',
    ...overrides,
  };
}

describe('Save for later UI (US3)', () => {
  it('moves item to saved list and updates totals', async () => {
    const api: CartApi = {
      async getCart() {
        return makeCart();
      },
      async addItem() {
        return makeCart();
      },
      async setQty() {
        return makeCart();
      },
      async saveForLater({ sku }) {
        return makeCart({ active_items: [], saved_items: [{ sku }], grand_total_minor: 0, grand_total_display: '0.00' });
      },
    };

    render(
      <CartProvider api={api} initialCart={makeCart()}>
        <CartPage />
      </CartProvider>,
    );

    expect(screen.getByTestId('grand-total').textContent).toBe('100.00');
    fireEvent.click(screen.getByText('Save for later'));

    expect(await screen.findByTestId('saved-SKU-005')).toBeTruthy();
    expect(screen.getByTestId('grand-total').textContent).toBe('0.00');
  });
});


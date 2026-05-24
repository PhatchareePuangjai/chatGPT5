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
        sku: 'A',
        unit_price_minor: 10000,
        unit_price_display: '100.00',
        qty: 1,
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

describe('Cart totals UI (US1)', () => {
  it('updates totals after quantity update', async () => {
    const api: CartApi = {
      async getCart() {
        return makeCart();
      },
      async addItem() {
        return makeCart();
      },
      async setQty({ qty }) {
        return makeCart({
          active_items: [
            {
              sku: 'A',
              unit_price_minor: 10000,
              unit_price_display: '100.00',
              qty,
              line_total_minor: 10000 * qty,
              line_total_display: `${100 * qty}.00`,
            },
          ],
          grand_total_minor: 10000 * qty,
          grand_total_display: `${100 * qty}.00`,
        });
      },
      async saveForLater() {
        return makeCart();
      },
    };

    render(
      <CartProvider api={api} initialCart={makeCart()}>
        <CartPage />
      </CartProvider>,
    );

    expect(screen.getByTestId('grand-total').textContent).toBe('100.00');
    fireEvent.change(screen.getByLabelText('qty-A'), { target: { value: '3' } });
    fireEvent.click(screen.getByText('Update'));

    // Store updates asynchronously.
    expect(await screen.findByText('300.00')).toBeTruthy();
    expect(screen.getByTestId('grand-total').textContent).toBe('300.00');
  });
});


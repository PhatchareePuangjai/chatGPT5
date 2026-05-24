import React from 'react';
import { useCart } from '../state/cartStore';

export function CartTotals() {
  const { state } = useCart();
  const total = state.cart?.grand_total_display ?? '0.00';
  return (
    <div aria-label="cart-totals">
      <div>
        <strong>Total</strong>: <span data-testid="grand-total">{total}</span>
      </div>
    </div>
  );
}


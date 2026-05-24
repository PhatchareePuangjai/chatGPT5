import React, { useEffect } from 'react';
import { CartItemRow } from '../components/CartItemRow';
import { CartTotals } from '../components/CartTotals';
import { SavedItemsList } from '../components/SavedItemsList';
import { AddToCartForm } from '../components/AddToCartForm';
import { useCart } from '../state/cartStore';

export function CartPage() {
  const { state, actions } = useCart();

  useEffect(() => {
    if (!state.cart) void actions.refresh();
  }, [state.cart, actions]);

  const items = state.cart?.active_items ?? [];

  return (
    <div>
      <h1>Cart</h1>
      {state.error ? <div role="alert">{state.error}</div> : null}
      {state.loading && !state.cart ? <div>Loading...</div> : null}
      <AddToCartForm />
      <div aria-label="active-items">
        {items.length === 0 ? <div>No active items</div> : null}
        {items.map((it) => (
          <CartItemRow key={it.sku} item={it} />
        ))}
      </div>
      <CartTotals />
      <SavedItemsList />
    </div>
  );
}

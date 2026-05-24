import React from 'react';
import { useCart } from '../state/cartStore';

export function SavedItemsList() {
  const { state } = useCart();
  const items = state.cart?.saved_items ?? [];
  return (
    <div aria-label="saved-items">
      <h2>Saved for later</h2>
      {items.length === 0 ? <div>No saved items</div> : null}
      <ul>
        {items.map((it) => (
          <li key={it.sku} data-testid={`saved-${it.sku}`}>
            {it.sku}
          </li>
        ))}
      </ul>
    </div>
  );
}


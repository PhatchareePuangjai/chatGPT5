import React, { useState } from 'react';
import { useCart } from '../state/cartStore';

export function AddToCartForm() {
  const { actions, state } = useCart();
  const [sku, setSku] = useState('SKU-001');
  const [qty, setQty] = useState(1);

  const disabled = state.loading;

  return (
    <form
      aria-label="add-to-cart"
      onSubmit={(e) => {
        e.preventDefault();
        void actions.addItem(sku, qty);
      }}
    >
      <label>
        SKU
        <input value={sku} onChange={(e) => setSku(e.target.value)} disabled={disabled} />
      </label>
      <label>
        Qty
        <input
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          disabled={disabled}
        />
      </label>
      <button type="submit" disabled={disabled}>
        Add to cart
      </button>
    </form>
  );
}


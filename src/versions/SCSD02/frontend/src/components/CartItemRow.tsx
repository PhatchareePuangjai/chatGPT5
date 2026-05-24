import React, { useState } from 'react';
import type { CartItem } from '../services/cartApi';
import { useCart } from '../state/cartStore';

export function CartItemRow(props: { item: CartItem }) {
  const { actions, state } = useCart();
  const [qty, setQty] = useState<number>(props.item.qty);

  const disabled = state.loading;

  return (
    <div aria-label={`cart-item-${props.item.sku}`}>
      <div>
        <strong>{props.item.sku}</strong>
      </div>
      <div>
        Unit: {props.item.unit_price_display} Line: {props.item.line_total_display}
      </div>
      <label>
        Qty
        <input
          aria-label={`qty-${props.item.sku}`}
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          disabled={disabled}
        />
      </label>
      <button onClick={() => actions.setQty(props.item.sku, qty)} disabled={disabled}>
        Update
      </button>
      <button onClick={() => actions.saveForLater(props.item.sku)} disabled={disabled}>
        Save for later
      </button>
    </div>
  );
}


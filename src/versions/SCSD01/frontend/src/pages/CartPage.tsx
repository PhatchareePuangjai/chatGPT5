import React, { useEffect, useState } from 'react';
import { getCart, patchQuantity, saveForLater, type CartView } from '../services/cartApi';
import { QuantityControl } from '../components/QuantityControl';
import { InlineError } from '../components/InlineError';

function formatMinor(n: number): string {
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(n);
  const dollars = Math.floor(abs / 100);
  const cents = abs % 100;
  return `${sign}${dollars}.${String(cents).padStart(2, '0')}`;
}

export function CartPage(): JSX.Element {
  const [cart, setCart] = useState<CartView | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await getCart();
        if (!cancelled) setCart(data);
      } catch (e) {
        if (!cancelled) setError(String(e instanceof Error ? e.message : e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onQtyChange(sku: string, nextQty: number): Promise<void> {
    setError('');
    try {
      const data = await patchQuantity(sku, nextQty);
      setCart(data);
    } catch (e) {
      setError(String(e instanceof Error ? e.message : e));
    }
  }

  async function onSaveForLater(sku: string): Promise<void> {
    setError('');
    try {
      const data = await saveForLater(sku);
      setCart(data);
    } catch (e) {
      setError(String(e instanceof Error ? e.message : e));
    }
  }

  if (loading) return <div>Loading cart...</div>;
  if (!cart) return <div>Cart unavailable.</div>;

  return (
    <div style={{ padding: 16, maxWidth: 900, margin: '0 auto' }}>
      <h1>Shopping Cart</h1>

      <h2>Active Items</h2>
      {cart.items_active.length === 0 ? (
        <div>No active items.</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th align="left">SKU</th>
              <th align="left">Qty</th>
              <th align="right">Unit</th>
              <th align="right">Line Total</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {cart.items_active.map((item) => (
              <tr key={`${item.sku}:${item.status}`} style={{ borderTop: '1px solid #eee' }}>
                <td>{item.sku}</td>
                <td>
                  <QuantityControl sku={item.sku} value={item.quantity} onChange={(n) => onQtyChange(item.sku, n)} />
                </td>
                <td align="right">{formatMinor(item.unit_price_minor)}</td>
                <td align="right">{formatMinor(item.line_total_minor)}</td>
                <td align="right">
                  <button type="button" onClick={() => onSaveForLater(item.sku)}>
                    Save for later
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ marginTop: 12, fontWeight: 700 }}>Grand Total: {formatMinor(cart.grand_total_minor)}</div>

      <h2 style={{ marginTop: 24 }}>Saved Items</h2>
      {cart.items_saved.length === 0 ? (
        <div>No saved items.</div>
      ) : (
        <ul>
          {cart.items_saved.map((item) => (
            <li key={`${item.sku}:${item.status}`}>{item.sku}</li>
          ))}
        </ul>
      )}

      {error ? <InlineError message={error} /> : null}
    </div>
  );
}


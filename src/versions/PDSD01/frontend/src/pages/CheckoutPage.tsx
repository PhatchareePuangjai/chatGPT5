import React from 'react';

import { apiDelete, apiGet, apiPost } from '../services/apiClient.js';
import { CouponCodeForm } from '../components/CouponCodeForm.js';
import { PricingSummary, type PricingBreakdown } from '../components/PricingSummary.js';

type PricingResponse = { cartId: string; pricing: PricingBreakdown };
type ApplyCouponResponse = { status: 'applied'; message: string; pricing: PricingBreakdown };

export function CheckoutPage() {
  const [cartId, setCartId] = React.useState('c1000');
  const [pricing, setPricing] = React.useState<PricingBreakdown | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  async function refresh() {
    const result = await apiGet<PricingResponse>(`/api/carts/${cartId}/pricing`);
    if (result.ok) setPricing(result.data.pricing);
  }

  React.useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartId]);

  async function apply(code: string) {
    setBusy(true);
    setMessage(null);
    try {
      const result = await apiPost<ApplyCouponResponse>(`/api/carts/${cartId}/coupon`, { code });
      if (result.ok) {
        setPricing(result.data.pricing);
        setMessage(result.data.message);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const msg = (result.error as any)?.message ?? 'Error';
        setMessage(String(msg));
      }
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    setMessage(null);
    try {
      await apiDelete(`/api/carts/${cartId}/coupon`);
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ maxWidth: 720, margin: '40px auto', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Checkout</h1>

      <section aria-label="Cart">
        <label htmlFor="cart-id">Cart</label>
        <select id="cart-id" value={cartId} onChange={(e) => setCartId(e.target.value)} disabled={busy}>
          <option value="c1000">Demo cart 1,000 THB</option>
          <option value="c2000">Demo cart 2,000 THB</option>
          <option value="c50">Demo cart 50 THB</option>
        </select>
      </section>

      <div style={{ marginTop: 16 }}>
        <CouponCodeForm onApply={apply} onRemove={remove} disabled={busy} />
      </div>

      {message ? (
        <p role="status" style={{ marginTop: 12 }}>
          {message}
        </p>
      ) : null}

      <div style={{ marginTop: 16 }}>
        <PricingSummary pricing={pricing} />
      </div>
    </main>
  );
}

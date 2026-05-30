import React from 'react';
import { applyCoupon } from '../services/checkoutApi';
import type { ApplyCouponResponse } from '../services/checkoutTypes';

export function CouponInput(props: {
  cartId: string;
  onApplied: (result: ApplyCouponResponse) => void;
  onErrorMessage: (message: string) => void;
}) {
  const [couponCode, setCouponCode] = React.useState('');
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatusMessage(null);

    try {
      const res = await applyCoupon(props.cartId, couponCode);
      setStatusMessage(res.message ?? null);
      props.onApplied(res);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to apply coupon';
      setStatusMessage(msg);
      props.onErrorMessage(msg);
    }
  }

  return (
    <form onSubmit={onSubmit} aria-label="Coupon">
      <label htmlFor="coupon-code">Coupon code</label>
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <input
          id="coupon-code"
          name="couponCode"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
        />
        <button type="submit">Apply</button>
      </div>
      {statusMessage ? <p role="status">{statusMessage}</p> : null}
    </form>
  );
}


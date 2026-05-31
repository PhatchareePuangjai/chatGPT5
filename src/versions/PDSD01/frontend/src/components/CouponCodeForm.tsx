import React from 'react';

type Props = {
  onApply: (code: string) => void;
  onRemove: () => void;
  disabled?: boolean;
};

export function CouponCodeForm(props: Props) {
  const [code, setCode] = React.useState('');

  return (
    <section aria-label="Coupon">
      <label htmlFor="coupon-code">Coupon code</label>
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <input
          id="coupon-code"
          aria-label="Coupon code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="e.g. SAVE100"
          disabled={props.disabled}
        />
        <button type="button" onClick={() => props.onApply(code)} disabled={props.disabled || code.trim() === ''}>
          Apply
        </button>
        <button type="button" onClick={props.onRemove} disabled={props.disabled}>
          Remove
        </button>
      </div>
    </section>
  );
}

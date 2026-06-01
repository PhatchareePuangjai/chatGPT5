import React from 'react';

export function QuantityControl(props: {
  sku: string;
  value: number;
  onChange: (next: number) => void;
}): JSX.Element {
  const { sku, value, onChange } = props;
  return (
    <div aria-label={`Quantity for ${sku}`} style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
      <button type="button" onClick={() => onChange(Math.max(0, value - 1))} aria-label="Decrease quantity">
        -
      </button>
      <input
        aria-label="Quantity"
        inputMode="numeric"
        value={value}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (Number.isFinite(n)) onChange(Math.max(0, Math.floor(n)));
        }}
        style={{ width: 60 }}
      />
      <button type="button" onClick={() => onChange(value + 1)} aria-label="Increase quantity">
        +
      </button>
    </div>
  );
}


import React from 'react';

import type { Money } from '../lib/moneyFormat.js';
import { formatMoney } from '../lib/moneyFormat.js';

export type DiscountLine = { kind: 'coupon' | 'promotion'; label: string; amount: Money };

export type PricingBreakdown = {
  subtotal: Money;
  discount_lines: DiscountLine[];
  grand_total: Money;
};

export function PricingSummary(props: { pricing: PricingBreakdown | null }) {
  if (!props.pricing) return <p>Loading pricing…</p>;
  const pricing = props.pricing;
  return (
    <section aria-label="Pricing">
      <h2>Summary</h2>
      <dl>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
          <dt>Subtotal</dt>
          <dd>{formatMoney(pricing.subtotal)}</dd>
        </div>
        {pricing.discount_lines.map((l, idx) => (
          <div key={`${l.kind}-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
            <dt>{l.label}</dt>
            <dd>-{formatMoney(l.amount)}</dd>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginTop: 8 }}>
          <dt>
            <strong>Grand total</strong>
          </dt>
          <dd>
            <strong>{formatMoney(pricing.grand_total)}</strong>
          </dd>
        </div>
      </dl>
    </section>
  );
}


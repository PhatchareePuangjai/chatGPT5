import React from 'react';
import { CouponInput } from '../components/CouponInput';
import { getTotals } from '../services/checkoutApi';
import type { CheckoutTotalsResponse } from '../services/checkoutTypes';

export function CheckoutPage() {
  const [data, setData] = React.useState<CheckoutTotalsResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    getTotals('demo-cart')
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load totals'));
  }, []);

  return (
    <main style={{ maxWidth: 560, margin: '40px auto', padding: 16 }}>
      <h1>Checkout</h1>

      <CouponInput
        cartId="demo-cart"
        onApplied={(result) => setData({ totals: result.totals, discountLines: result.discountLines })}
        onErrorMessage={(msg) => setError(msg)}
      />

      {error ? (
        <p role="alert">{error}</p>
      ) : null}

      <section aria-label="Totals">
        <h2>Totals</h2>
        {error ? (
          <p role="alert">Totals error: {error}</p>
        ) : data ? (
          <>
            <dl>
              <dt>Subtotal</dt>
              <dd>{data.totals.subtotalSatang}</dd>
              <dt>Discount</dt>
              <dd>{data.totals.discountTotalSatang}</dd>
              <dt>Grand total</dt>
              <dd>{data.totals.grandTotalSatang}</dd>
            </dl>

            <h3>Discount lines</h3>
            {data.discountLines.length ? (
              <ul>
                {data.discountLines.map((l) => (
                  <li key={`${l.type}:${l.order}:${l.label}`}>
                    {l.label}: {l.amountSatang}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No discounts</p>
            )}
          </>
        ) : (
          <p>Loading…</p>
        )}
      </section>
    </main>
  );
}

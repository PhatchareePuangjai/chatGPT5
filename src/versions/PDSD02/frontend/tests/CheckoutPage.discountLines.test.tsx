import React from 'react';
import { render, screen } from '@testing-library/react';
import { CheckoutPage } from '../src/pages/CheckoutPage';

describe('CheckoutPage discount lines', () => {
  it('renders discount line items from totals response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        return new Response(
          JSON.stringify({
            totals: { currency: 'THB', subtotalSatang: 200000, discountTotalSatang: 20000, grandTotalSatang: 180000 },
            discountLines: [{ type: 'PROMOTION', label: '10% off', amountSatang: 20000, order: 1 }],
          }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        );
      }),
    );

    render(<CheckoutPage />);

    expect(await screen.findByText(/10% off/i)).toBeInTheDocument();
  });
});


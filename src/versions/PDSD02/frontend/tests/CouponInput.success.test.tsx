import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CouponInput } from '../src/components/CouponInput';

describe('CouponInput - success', () => {
  it('shows success message when API returns message', async () => {
    const user = userEvent.setup();

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        return new Response(
          JSON.stringify({
            totals: { currency: 'THB', subtotalSatang: 100000, discountTotalSatang: 10000, grandTotalSatang: 90000 },
            discountLines: [{ type: 'COUPON', label: 'Coupon SAVE100', amountSatang: 10000, order: 2 }],
            message: 'ใช้คูปองสำเร็จ',
          }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        );
      }),
    );

    render(
      <CouponInput cartId="demo-cart" onApplied={() => {}} onErrorMessage={() => {}} />,
    );

    await user.type(screen.getByLabelText(/coupon code/i), 'SAVE100');
    await user.click(screen.getByRole('button', { name: /apply/i }));

    expect(await screen.findByRole('status')).toHaveTextContent('ใช้คูปองสำเร็จ');
  });
});


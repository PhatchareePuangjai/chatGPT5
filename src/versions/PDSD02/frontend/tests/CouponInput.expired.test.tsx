import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CouponInput } from '../src/components/CouponInput';

describe('CouponInput - expired', () => {
  it('shows expired message on 409 error', async () => {
    const user = userEvent.setup();

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        return new Response(JSON.stringify({ code: 'COUPON_EXPIRED', message: 'คูปองหมดอายุ' }), {
          status: 409,
          headers: { 'content-type': 'application/json' },
        });
      }),
    );

    render(<CouponInput cartId="demo-cart" onApplied={() => {}} onErrorMessage={() => {}} />);

    await user.type(screen.getByLabelText(/coupon code/i), 'EXPIRED');
    await user.click(screen.getByRole('button', { name: /apply/i }));

    expect(await screen.findByRole('status')).toHaveTextContent('คูปองหมดอายุ');
  });
});


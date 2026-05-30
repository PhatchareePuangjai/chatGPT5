import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CouponInput } from '../src/components/CouponInput';

describe('CouponInput - usage limit reached', () => {
  it('shows usage-limit message on 409 error', async () => {
    const user = userEvent.setup();

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        return new Response(
          JSON.stringify({ code: 'COUPON_USAGE_LIMIT_REACHED', message: 'คุณใช้สิทธิ์ครบแล้ว' }),
          { status: 409, headers: { 'content-type': 'application/json' } },
        );
      }),
    );

    render(<CouponInput cartId="demo-cart" onApplied={() => {}} onErrorMessage={() => {}} />);

    await user.type(screen.getByLabelText(/coupon code/i), 'WELCOME');
    await user.click(screen.getByRole('button', { name: /apply/i }));

    expect(await screen.findByRole('status')).toHaveTextContent('คุณใช้สิทธิ์ครบแล้ว');
  });
});


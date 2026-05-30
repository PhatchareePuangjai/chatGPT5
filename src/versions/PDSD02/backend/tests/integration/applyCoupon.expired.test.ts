import { withTestServer } from '../helpers/http';

describe('Apply coupon - expired coupon rejection (EXPIRED)', () => {
  it('rejects expired coupon and returns message', async () => {
    await withTestServer(async (baseUrl) => {
      const res = await fetch(`${baseUrl}/checkout/apply-coupon`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ cartId: 'demo-cart', couponCode: 'EXPIRED' }),
      });
      expect(res.status).toBe(409);
      const body = (await res.json()) as any;
      expect(body.code).toBe('COUPON_EXPIRED');
      expect(body.message).toBe('คูปองหมดอายุ');
    });
  });
});


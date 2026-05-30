import { withTestServer } from '../helpers/http';

describe('Apply coupon - usage limit reached (WELCOME)', () => {
  it('rejects second use for same user', async () => {
    await withTestServer(async (baseUrl) => {
      const first = await fetch(`${baseUrl}/checkout/apply-coupon`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ cartId: 'demo-cart', couponCode: 'WELCOME' }),
      });
      expect(first.status).toBe(200);

      const second = await fetch(`${baseUrl}/checkout/apply-coupon`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ cartId: 'demo-cart', couponCode: 'WELCOME' }),
      });
      expect(second.status).toBe(409);
      const body = (await second.json()) as any;
      expect(body.code).toBe('COUPON_USAGE_LIMIT_REACHED');
      expect(body.message).toBe('คุณใช้สิทธิ์ครบแล้ว');
    });
  });
});


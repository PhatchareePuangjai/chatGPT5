import { withTestServer } from '../helpers/http';

describe('POST /checkout/apply-coupon (contract)', () => {
  it('returns totals + discountLines + message for valid coupon', async () => {
    await withTestServer(async (baseUrl) => {
      const res = await fetch(`${baseUrl}/checkout/apply-coupon`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ cartId: 'demo-cart', couponCode: 'SAVE100' }),
      });

      expect(res.status).toBe(200);
      const body = (await res.json()) as any;

      expect(body).toHaveProperty('totals');
      expect(body.totals).toHaveProperty('currency', 'THB');
      expect(typeof body.totals.subtotalSatang).toBe('number');
      expect(typeof body.totals.discountTotalSatang).toBe('number');
      expect(typeof body.totals.grandTotalSatang).toBe('number');

      expect(Array.isArray(body.discountLines)).toBe(true);
      expect(typeof body.message).toBe('string');
    });
  });
});


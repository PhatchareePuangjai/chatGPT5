import { withTestServer } from '../helpers/http';

describe('Apply coupon - success path (SAVE100)', () => {
  it('applies 100 THB discount when min spend met', async () => {
    await withTestServer(async (baseUrl) => {
      const res = await fetch(`${baseUrl}/checkout/apply-coupon`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ cartId: 'demo-cart', couponCode: 'SAVE100' }),
      });
      expect(res.status).toBe(200);
      const body = (await res.json()) as any;
      expect(body.totals.subtotalSatang).toBe(100000);
      expect(body.totals.grandTotalSatang).toBe(90000);
      expect(body.message).toBe('ใช้คูปองสำเร็จ');
    });
  });
});


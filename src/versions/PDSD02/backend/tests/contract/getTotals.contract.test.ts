import { withTestServer } from '../helpers/http';

describe('GET /checkout/totals (contract)', () => {
  it('returns totals and discountLines', async () => {
    await withTestServer(async (baseUrl) => {
      const res = await fetch(`${baseUrl}/checkout/totals?cartId=demo-cart`);
      expect(res.status).toBe(200);
      const body = (await res.json()) as any;
      expect(body).toHaveProperty('totals');
      expect(body).toHaveProperty('discountLines');
      expect(Array.isArray(body.discountLines)).toBe(true);
    });
  });
});


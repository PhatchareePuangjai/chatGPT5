import { withTestServer } from '../helpers/http';

describe('Totals - 10% cart promotion', () => {
  it('calculates 2,000 THB -> 1,800 THB with 200 THB discount', async () => {
    await withTestServer(async (baseUrl) => {
      const res = await fetch(`${baseUrl}/checkout/totals?cartId=demo-cart`);
      expect(res.status).toBe(200);
      const body = (await res.json()) as any;
      expect(body.totals.subtotalSatang).toBe(200000);
      expect(body.totals.discountTotalSatang).toBe(20000);
      expect(body.totals.grandTotalSatang).toBe(180000);
    });
  });
});


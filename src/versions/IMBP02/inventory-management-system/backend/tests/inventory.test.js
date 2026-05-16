const supertest = require('supertest');
let app;

beforeEach(() => {
  jest.resetModules();
  app = require('../server');
});

describe('Inventory System Tests — IMBP02', () => {

  describe('Acceptance Scenarios', () => {

    test('Test 1: Successful Stock Deduction', async () => {
      // Laptop (id="1", stock=10) ซื้อ 2 → stock=8
      const res = await supertest(app)
        .post('/api/inventory/purchase')
        .send({ productId: '1', quantity: 2 });
      expect(res.status).toBe(200);
      expect(res.body.product.stock).toBe(8);

      const { body: products } = await supertest(app).get('/api/inventory');
      expect(products.find(p => p.id === '1').stock).toBe(8);

      const { body: history } = await supertest(app).get('/api/inventory/history');
      const log = history.find(h => h.productId === '1' && h.change === -2);
      expect(log).toBeDefined();
    });

    test('Test 2: Low Stock Alert Trigger', async () => {
      // Phone (id="2", stock=8) ซื้อ 4 → stock=4 (4 < 5 → low stock alert)
      const res = await supertest(app)
        .post('/api/inventory/purchase')
        .send({ productId: '2', quantity: 4 });
      expect(res.status).toBe(200);
      expect(res.body.product.stock).toBe(4);

      const { body: lowStock } = await supertest(app).get('/api/inventory/low-stock');
      expect(lowStock.find(p => p.id === '2')).toBeDefined();
    });

    test('Test 3: Stock Restoration', async () => {
      // Headphones (id="3", stock=4) ซื้อ 1 → stock=3
      await supertest(app)
        .post('/api/inventory/purchase')
        .send({ productId: '3', quantity: 1 });

      // Restock endpoint ไม่มีใน IMBP02 → test นี้จะ FAIL (expose missing feature)
      const restockRes = await supertest(app)
        .post('/api/inventory/restock')
        .send({ productId: '3', quantity: 1 });
      expect(restockRes.status).toBe(200);

      const { body: products } = await supertest(app).get('/api/inventory');
      expect(products.find(p => p.id === '3').stock).toBe(4);

      const { body: history } = await supertest(app).get('/api/inventory/history');
      expect(history.find(h => h.productId === '3' && h.change > 0)).toBeDefined();
    });

  });

  describe('Edge Cases', () => {

    test('Edge Case 1: Race Condition', async () => {
      // Setup: Laptop 10 → 1 (ซื้อ 9 ก่อน)
      await supertest(app)
        .post('/api/inventory/purchase')
        .send({ productId: '1', quantity: 9 });

      // ส่ง 5 request พร้อมกัน ซื้อ 1 ชิ้น → ต้องสำเร็จแค่ 1
      const requests = Array(5).fill().map(() =>
        supertest(app).post('/api/inventory/purchase').send({ productId: '1', quantity: 1 })
      );
      const results = await Promise.all(requests);

      expect(results.filter(r => r.status === 200).length).toBe(1);
      expect(results.filter(r => r.status === 400).length).toBe(4);

      const { body: products } = await supertest(app).get('/api/inventory');
      expect(products.find(p => p.id === '1').stock).toBe(0);
    });

    test('Edge Case 2: Transaction Atomicity — Failed purchase does not modify state', async () => {
      // productId ไม่มีอยู่ → 404, ไม่มี history, stock ไม่เปลี่ยน
      const res = await supertest(app)
        .post('/api/inventory/purchase')
        .send({ productId: 'INVALID', quantity: 1 });
      expect(res.status).toBe(404);

      const { body: history } = await supertest(app).get('/api/inventory/history');
      expect(history.length).toBe(0);

      const { body: products } = await supertest(app).get('/api/inventory');
      expect(products.find(p => p.id === '1').stock).toBe(10);
    });

    test('Edge Case 3: Overselling Attempt', async () => {
      // Laptop (id="1", stock=10) สั่งซื้อ 11 → 400, stock ไม่เปลี่ยน
      const res = await supertest(app)
        .post('/api/inventory/purchase')
        .send({ productId: '1', quantity: 11 });
      expect(res.status).toBe(400);

      const { body: products } = await supertest(app).get('/api/inventory');
      expect(products.find(p => p.id === '1').stock).toBe(10);
    });

    test('Edge Case 4: Boundary Value — Low stock threshold', async () => {
      // Phone (id="2", stock=8). Scenario กำหนด threshold ≤5

      // 8→6 (ซื้อ 2): ไม่ alert
      await supertest(app).post('/api/inventory/purchase').send({ productId: '2', quantity: 2 });
      let { body: ls } = await supertest(app).get('/api/inventory/low-stock');
      expect(ls.find(p => p.id === '2')).toBeUndefined();

      // 6→5 (ซื้อ 1): ต้อง alert (≤5 per scenario) — จะ FAIL เพราะ code ใช้ < 5
      await supertest(app).post('/api/inventory/purchase').send({ productId: '2', quantity: 1 });
      ({ body: ls } = await supertest(app).get('/api/inventory/low-stock'));
      expect(ls.find(p => p.id === '2')).toBeDefined();

      // 5→4 (ซื้อ 1): alert
      await supertest(app).post('/api/inventory/purchase').send({ productId: '2', quantity: 1 });
      ({ body: ls } = await supertest(app).get('/api/inventory/low-stock'));
      expect(ls.find(p => p.id === '2')).toBeDefined();
    });

  });

});

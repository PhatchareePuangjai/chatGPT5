// app.js (CommonJS)
const express = require("express");
const cors = require("cors");
const { pool } = require("./db");

const app = express();
app.use(express.json());
app.use(cors({ origin: true }));

app.get("/health", (_, res) => res.json({ ok: true }));

/**
 * GET /api/products/:id
 * Shows product + last 50 logs (useful to verify low-stock and race-condition tests).
 */
app.get("/api/products/:id", async (req, res) => {
  const productId = Number(req.params.id);
  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({ error: "Invalid productId" });
  }

  const client = await pool.connect();
  try {
    const p = await client.query(
      `SELECT id, sku, name, stock, low_stock_threshold, updated_at
       FROM products
       WHERE id = $1`,
      [productId]
    );
    if (p.rows.length === 0) return res.status(404).json({ error: "Product not found" });

    const logs = await client.query(
      `SELECT id, type, quantity, note, created_at
       FROM inventory_log
       WHERE product_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [productId]
    );

    return res.json({ product: p.rows[0], recentLogs: logs.rows });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch product", details: err.message });
  } finally {
    client.release();
  }
});

/**
 * POST /api/purchase
 * Body: { productId: number, quantity: number, txId?: string }
 */
app.post("/api/purchase", async (req, res) => {
  const productId = Number(req.body.productId);
  const quantity = Number(req.body.quantity);

  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({ error: "Invalid productId" });
  }
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return res.status(400).json({ error: "Invalid quantity" });
  }

  // Business rule threshold (default 5)
  const threshold = Number.isFinite(Number(process.env.LOW_STOCK_THRESHOLD))
    ? Number(process.env.LOW_STOCK_THRESHOLD)
    : 5;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Lock product row
    const { rows } = await client.query(
      `
      SELECT id, stock, low_stock_threshold
      FROM products
      WHERE id = $1
      FOR UPDATE
      `,
      [productId]
    );

    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Product not found" });
    }

    const product = rows[0];

    // Overselling prevention: validate BEFORE any write
    if (quantity > product.stock) {
      await client.query("ROLLBACK");
      return res.status(409).json({
        error: "Insufficient stock",
        available: product.stock,
        requested: quantity
      });
    }

    const remainingStock = product.stock - quantity;

    // Update stock
    await client.query(`UPDATE products SET stock = $1 WHERE id = $2`, [remainingStock, productId]);

    // SALE log (same transaction => atomic)
    await client.query(
      `
      INSERT INTO inventory_log (product_id, type, quantity, note)
      VALUES ($1, 'SALE', $2, $3)
      `,
      [productId, quantity, `Purchase deducted ${quantity}`]
    );

    // Low stock alert trigger (STRICT <=)
    const lowStockAlertTriggered = remainingStock <= threshold;

    if (lowStockAlertTriggered) {
      await client.query(
        `
        INSERT INTO inventory_log (product_id, type, quantity, note)
        VALUES ($1, 'LOW_STOCK_ALERT', 1, $2)
        `,
        [productId, `Low stock alert: remaining=${remainingStock} (<= ${threshold})`]
      );
    }

    await client.query("COMMIT");

    return res.json({
      ok: true,
      productId,
      purchased: quantity,
      remainingStock,
      lowStockAlertTriggered,
      lowStockThresholdUsed: threshold
    });
  } catch (err) {
    // Atomic rollback on any failure (including log failures)
    try { await client.query("ROLLBACK"); } catch (_) {}
    return res.status(500).json({ error: "Purchase failed (rolled back)", details: err.message });
  } finally {
    client.release();
  }
});

/**
 * POST /api/restore
 * Body: { productId: number, quantity: number, reason?: string }
 */
app.post("/api/restore", async (req, res) => {
  const productId = Number(req.body.productId);
  const quantity = Number(req.body.quantity);
  const reason = typeof req.body.reason === "string" ? req.body.reason : "Cancellation/Return";

  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({ error: "Invalid productId" });
  }
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return res.status(400).json({ error: "Invalid quantity" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      `SELECT id, stock FROM products WHERE id = $1 FOR UPDATE`,
      [productId]
    );

    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Product not found" });
    }

    const currentStock = rows[0].stock;
    const newStock = currentStock + quantity;

    await client.query(`UPDATE products SET stock = $1 WHERE id = $2`, [newStock, productId]);

    await client.query(
      `
      INSERT INTO inventory_log (product_id, type, quantity, note)
      VALUES ($1, 'RESTOCK/RETURN', $2, $3)
      `,
      [productId, quantity, reason]
    );

    await client.query("COMMIT");
    return res.json({ ok: true, productId, restored: quantity, newStock });
  } catch (err) {
    try { await client.query("ROLLBACK"); } catch (_) {}
    return res.status(500).json({ error: "Restore failed (rolled back)", details: err.message });
  } finally {
    client.release();
  }
});

if (require.main === module) {
  const port = Number(process.env.PORT || 3000);
  app.listen(port, () => console.log(`API listening on :${port}`));
}

module.exports = app;

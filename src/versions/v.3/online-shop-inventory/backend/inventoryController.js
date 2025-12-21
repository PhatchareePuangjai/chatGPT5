const { pool } = require("./db");

function threshold() {
  const t = Number(process.env.LOW_STOCK_THRESHOLD ?? "5");
  return Number.isFinite(t) ? t : 5;
}

// GET /api/products
async function listProducts(req, res) {
  try {
    const r = await pool.query(
      `SELECT id, sku, name, price_cents, stock, updated_at
       FROM products
       ORDER BY name ASC`
    );
    res.json({ items: r.rows });
  } catch (e) {
    console.error("listProducts:", e);
    res.status(500).json({ error: "Server error" });
  }
}

// GET /api/low-stock
async function listLowStock(req, res) {
  const t = threshold();
  try {
    const r = await pool.query(
      `SELECT id, sku, name, price_cents, stock, updated_at
       FROM products
       WHERE stock < $1
       ORDER BY stock ASC, name ASC`,
      [t]
    );
    res.json({ threshold: t, items: r.rows });
  } catch (e) {
    console.error("listLowStock:", e);
    res.status(500).json({ error: "Server error" });
  }
}

// POST /api/purchase  body: { productId, quantity }
async function purchase(req, res) {
  const { productId, quantity } = req.body;

  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({ error: "productId must be a positive integer" });
  }
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return res.status(400).json({ error: "quantity must be a positive integer" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // lock the product row to prevent overselling
    const pr = await client.query(
      `SELECT id, name, stock
       FROM products
       WHERE id = $1
       FOR UPDATE`,
      [productId]
    );

    if (pr.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Product not found" });
    }

    const product = pr.rows[0];
    const before = product.stock;

    if (before < quantity) {
      await client.query("ROLLBACK");
      return res.status(409).json({
        error: "Not enough stock",
        available: before,
        requested: quantity
      });
    }

    const after = before - quantity;

    await client.query(
      `UPDATE products SET stock = $1, updated_at = NOW() WHERE id = $2`,
      [after, productId]
    );

    await client.query(
      `INSERT INTO stock_history
         (product_id, change_type, delta, before_stock, after_stock, reason)
       VALUES ($1, 'PURCHASE', $2, $3, $4, $5)`,
      [productId, -quantity, before, after, "customer purchase"]
    );

    await client.query("COMMIT");

    if (after < threshold()) {
      console.log(`[LOW STOCK] productId=${productId} name="${product.name}" stock=${after}`);
    }

    return res.json({ ok: true, productId, beforeStock: before, afterStock: after });
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("purchase:", e);
    return res.status(500).json({ error: "Server error" });
  } finally {
    client.release();
  }
}

// POST /api/restock  body: { productId, quantity }
async function restock(req, res) {
  const { productId, quantity } = req.body;

  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({ error: "productId must be a positive integer" });
  }
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return res.status(400).json({ error: "quantity must be a positive integer" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const pr = await client.query(
      `SELECT id, name, stock
       FROM products
       WHERE id = $1
       FOR UPDATE`,
      [productId]
    );

    if (pr.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Product not found" });
    }

    const product = pr.rows[0];
    const before = product.stock;
    const after = before + quantity;

    await client.query(
      `UPDATE products SET stock = $1, updated_at = NOW() WHERE id = $2`,
      [after, productId]
    );

    await client.query(
      `INSERT INTO stock_history
         (product_id, change_type, delta, before_stock, after_stock, reason)
       VALUES ($1, 'RESTOCK', $2, $3, $4, $5)`,
      [productId, quantity, before, after, "admin restock"]
    );

    await client.query("COMMIT");

    return res.json({ ok: true, productId, beforeStock: before, afterStock: after });
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("restock:", e);
    return res.status(500).json({ error: "Server error" });
  } finally {
    client.release();
  }
}

// GET /api/history/:productId
async function history(req, res) {
  const productId = Number(req.params.productId);
  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({ error: "productId must be a positive integer" });
  }
  try {
    const r = await pool.query(
      `SELECT id, change_type, delta, before_stock, after_stock, reason, created_at
       FROM stock_history
       WHERE product_id = $1
       ORDER BY created_at DESC
       LIMIT 200`,
      [productId]
    );
    res.json({ productId, items: r.rows });
  } catch (e) {
    console.error("history:", e);
    res.status(500).json({ error: "Server error" });
  }
}

module.exports = {
  listProducts,
  listLowStock,
  purchase,
  restock,
  history
};

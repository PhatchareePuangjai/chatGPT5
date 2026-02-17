// backend/server.js
const express = require("express");
const { pool } = require("./db");

const app = express();
app.use(express.json());

// Demo: single cart id (fixed). In real systems, derive from auth/session.
const DEMO_CART_ID = process.env.CART_ID || "00000000-0000-0000-0000-000000000001";

function asInt(value) {
  const n = Number(value);
  if (!Number.isInteger(n)) return null;
  return n;
}

function apiError(res, status, code, message, extra = {}) {
  return res.status(status).json({ ok: false, code, message, ...extra });
}

async function getCartSnapshot(client, cartId) {
  // All totals computed in integer cents, with bigint safety on multiplication
  const itemsRes = await client.query(
    `
    SELECT
      ci.sku,
      p.name,
      p.price_cents,
      p.stock,
      ci.quantity,
      ci.status,
      (ci.quantity::bigint * p.price_cents::bigint) AS line_total_cents
    FROM cart_items ci
    JOIN products p ON p.sku = ci.sku
    WHERE ci.cart_id = $1
    ORDER BY ci.created_at ASC;
    `,
    [cartId]
  );

  const totalsRes = await client.query(
    `
    SELECT
      COALESCE(SUM(CASE WHEN ci.status = 'ACTIVE'
        THEN (ci.quantity::bigint * p.price_cents::bigint) ELSE 0 END), 0) AS active_subtotal_cents,
      COALESCE(SUM(CASE WHEN ci.status = 'SAVED'
        THEN (ci.quantity::bigint * p.price_cents::bigint) ELSE 0 END), 0) AS saved_total_cents
    FROM cart_items ci
    JOIN products p ON p.sku = ci.sku
    WHERE ci.cart_id = $1;
    `,
    [cartId]
  );

  return {
    cartId,
    items: itemsRes.rows.map(r => ({
      sku: r.sku,
      name: r.name,
      price_cents: Number(r.price_cents),
      stock: Number(r.stock),
      quantity: Number(r.quantity),
      status: r.status,
      line_total_cents: Number(r.line_total_cents)
    })),
    totals: {
      active_subtotal_cents: Number(totalsRes.rows[0].active_subtotal_cents),
      saved_total_cents: Number(totalsRes.rows[0].saved_total_cents)
    }
  };
}

/**
 * Inventory guard rule:
 * - For add: (currentCartQty + addQty) <= stock
 * - For set: newQty <= stock
 * Stock is checked with SELECT ... FOR UPDATE to prevent race conditions at checkout time.
 */

app.get("/api/health", async (_req, res) => {
  try {
    const r = await pool.query("SELECT 1 AS ok");
    res.json({ ok: true, db: r.rows[0].ok === 1 });
  } catch (_e) {
    res.status(500).json({ ok: false, error: "db_unreachable" });
  }
});

app.get("/api/products", async (_req, res) => {
  const r = await pool.query(
    `SELECT sku, name, price_cents, stock FROM products ORDER BY sku ASC;`
  );
  res.json({ ok: true, products: r.rows.map(p => ({
    sku: p.sku,
    name: p.name,
    price_cents: Number(p.price_cents),
    stock: Number(p.stock)
  })) });
});

app.get("/api/cart", async (_req, res) => {
  const client = await pool.connect();
  try {
    const snap = await getCartSnapshot(client, DEMO_CART_ID);
    res.json({ ok: true, cart: snap });
  } finally {
    client.release();
  }
});

// Add item (merge by SKU). Default status becomes ACTIVE.
app.post("/api/cart/items", async (req, res) => {
  const sku = String(req.body?.sku || "").trim();
  const addQty = asInt(req.body?.quantity);

  if (!sku) return apiError(res, 400, "BAD_REQUEST", "sku is required");
  if (addQty == null || addQty <= 0) return apiError(res, 400, "BAD_REQUEST", "quantity must be a positive integer");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Lock product row to keep stock consistent with concurrent checkout operations
    const prodRes = await client.query(
      `SELECT sku, stock FROM products WHERE sku = $1 FOR UPDATE;`,
      [sku]
    );
    if (prodRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return apiError(res, 404, "NOT_FOUND", "Product not found");
    }
    const stock = Number(prodRes.rows[0].stock);

    // Lock cart item row (if exists)
    const itemRes = await client.query(
      `SELECT quantity FROM cart_items WHERE cart_id = $1 AND sku = $2 FOR UPDATE;`,
      [DEMO_CART_ID, sku]
    );

    const currentQty = itemRes.rowCount ? Number(itemRes.rows[0].quantity) : 0;

    // Inventory Guard: (CurrentCartQty + NewQty) <= Stock
    if (currentQty + addQty > stock) {
      await client.query("ROLLBACK");
      return apiError(res, 409, "INSUFFICIENT_STOCK", "Insufficient Stock", {
        sku,
        stock,
        currentCartQty: currentQty,
        requestedAddQty: addQty,
        maxAddQty: Math.max(0, stock - currentQty)
      });
    }

    if (itemRes.rowCount) {
      await client.query(
        `
        UPDATE cart_items
        SET quantity = quantity + $3,
            status = 'ACTIVE'
        WHERE cart_id = $1 AND sku = $2;
        `,
        [DEMO_CART_ID, sku, addQty]
      );
    } else {
      await client.query(
        `
        INSERT INTO cart_items (cart_id, sku, quantity, status)
        VALUES ($1, $2, $3, 'ACTIVE');
        `,
        [DEMO_CART_ID, sku, addQty]
      );
    }

    await client.query("COMMIT");
    const snap = await getCartSnapshot(client, DEMO_CART_ID);
    res.json({ ok: true, cart: snap });
  } catch (e) {
    await client.query("ROLLBACK");
    console.error(e);
    apiError(res, 500, "SERVER_ERROR", "Unexpected error");
  } finally {
    client.release();
  }
});

// Set absolute quantity (0 deletes)
app.patch("/api/cart/items/:sku", async (req, res) => {
  const sku = String(req.params.sku || "").trim();
  const newQty = asInt(req.body?.quantity);

  if (!sku) return apiError(res, 400, "BAD_REQUEST", "sku is required");
  if (newQty == null || newQty < 0) return apiError(res, 400, "BAD_REQUEST", "quantity must be an integer >= 0");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const prodRes = await client.query(
      `SELECT stock FROM products WHERE sku = $1 FOR UPDATE;`,
      [sku]
    );
    if (prodRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return apiError(res, 404, "NOT_FOUND", "Product not found");
    }
    const stock = Number(prodRes.rows[0].stock);

    const itemRes = await client.query(
      `SELECT quantity FROM cart_items WHERE cart_id = $1 AND sku = $2 FOR UPDATE;`,
      [DEMO_CART_ID, sku]
    );
    if (itemRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return apiError(res, 404, "NOT_FOUND", "Cart item not found");
    }

    if (newQty > stock) {
      await client.query("ROLLBACK");
      return apiError(res, 409, "INSUFFICIENT_STOCK", "Insufficient Stock", {
        sku,
        stock,
        requestedQty: newQty,
        maxQty: stock
      });
    }

    if (newQty === 0) {
      await client.query(
        `DELETE FROM cart_items WHERE cart_id = $1 AND sku = $2;`,
        [DEMO_CART_ID, sku]
      );
    } else {
      await client.query(
        `UPDATE cart_items SET quantity = $3 WHERE cart_id = $1 AND sku = $2;`,
        [DEMO_CART_ID, sku, newQty]
      );
    }

    await client.query("COMMIT");
    const snap = await getCartSnapshot(client, DEMO_CART_ID);
    res.json({ ok: true, cart: snap });
  } catch (e) {
    await client.query("ROLLBACK");
    console.error(e);
    apiError(res, 500, "SERVER_ERROR", "Unexpected error");
  } finally {
    client.release();
  }
});

// Toggle Save for Later
app.post("/api/cart/items/:sku/toggle-save", async (req, res) => {
  const sku = String(req.params.sku || "").trim();
  const saved = Boolean(req.body?.saved);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const prodRes = await client.query(
      `SELECT stock FROM products WHERE sku = $1 FOR UPDATE;`,
      [sku]
    );
    if (prodRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return apiError(res, 404, "NOT_FOUND", "Product not found");
    }
    const stock = Number(prodRes.rows[0].stock);

    const itemRes = await client.query(
      `SELECT quantity FROM cart_items WHERE cart_id = $1 AND sku = $2 FOR UPDATE;`,
      [DEMO_CART_ID, sku]
    );
    if (itemRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return apiError(res, 404, "NOT_FOUND", "Cart item not found");
    }

    const qty = Number(itemRes.rows[0].quantity);

    // When moving to ACTIVE, re-check stock in case stock changed since adding.
    if (!saved && qty > stock) {
      await client.query("ROLLBACK");
      return apiError(res, 409, "INSUFFICIENT_STOCK", "Insufficient Stock", {
        sku,
        stock,
        requestedQty: qty,
        maxQty: stock
      });
    }

    await client.query(
      `UPDATE cart_items SET status = $3 WHERE cart_id = $1 AND sku = $2;`,
      [DEMO_CART_ID, sku, saved ? "SAVED" : "ACTIVE"]
    );

    await client.query("COMMIT");
    const snap = await getCartSnapshot(client, DEMO_CART_ID);
    res.json({ ok: true, cart: snap });
  } catch (e) {
    await client.query("ROLLBACK");
    console.error(e);
    apiError(res, 500, "SERVER_ERROR", "Unexpected error");
  } finally {
    client.release();
  }
});

// Checkout ACTIVE items (atomic stock decrement to prevent overselling)
app.post("/api/cart/checkout", async (_req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Lock active items first
    const itemsRes = await client.query(
      `
      SELECT ci.sku, ci.quantity
      FROM cart_items ci
      WHERE ci.cart_id = $1 AND ci.status = 'ACTIVE'
      ORDER BY ci.created_at ASC
      FOR UPDATE;
      `,
      [DEMO_CART_ID]
    );

    if (itemsRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return apiError(res, 400, "EMPTY_CART", "No ACTIVE items to checkout");
    }

    // Lock products for the SKUs involved and validate stock
    for (const it of itemsRes.rows) {
      const sku = it.sku;
      const qty = Number(it.quantity);

      const prodRes = await client.query(
        `SELECT stock, price_cents FROM products WHERE sku = $1 FOR UPDATE;`,
        [sku]
      );
      const stock = Number(prodRes.rows[0].stock);

      if (qty > stock) {
        await client.query("ROLLBACK");
        return apiError(res, 409, "INSUFFICIENT_STOCK", "Insufficient Stock at checkout", {
          sku,
          stock,
          requestedQty: qty,
          maxQty: stock
        });
      }

      await client.query(
        `UPDATE products SET stock = stock - $2 WHERE sku = $1;`,
        [sku, qty]
      );
    }

    // Compute receipt totals (integer cents)
    const receipt = await client.query(
      `
      SELECT
        COALESCE(SUM(ci.quantity::bigint * p.price_cents::bigint), 0) AS total_cents
      FROM cart_items ci
      JOIN products p ON p.sku = ci.sku
      WHERE ci.cart_id = $1 AND ci.status = 'ACTIVE';
      `,
      [DEMO_CART_ID]
    );

    // Remove purchased items from cart (keep SAVED)
    await client.query(
      `DELETE FROM cart_items WHERE cart_id = $1 AND status = 'ACTIVE';`,
      [DEMO_CART_ID]
    );

    await client.query("COMMIT");

    const total_cents = Number(receipt.rows[0].total_cents);
    res.json({ ok: true, total_cents });
  } catch (e) {
    await client.query("ROLLBACK");
    console.error(e);
    apiError(res, 500, "SERVER_ERROR", "Unexpected error");
  } finally {
    client.release();
  }
});

const PORT = Number(process.env.PORT || 3000);
if (require.main === module) {
  app.listen(PORT, () => console.log(`Backend listening on :${PORT}`));
}

module.exports = { app };

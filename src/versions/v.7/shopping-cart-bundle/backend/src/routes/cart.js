const express = require("express");
const { withTx, pool } = require("../db");

const router = express.Router();

/**
 * Simple user identification for this bundle:
 * - Use X-User-Id header if present
 * - otherwise default to 1
 * In production: replace with auth/session.
 */
function getUserId(req) {
  const raw = req.header("X-User-Id");
  if (!raw) return 1;
  const n = Number(raw);
  if (!Number.isInteger(n) || n <= 0) {
    const err = new Error("Invalid X-User-Id");
    err.status = 400;
    throw err;
  }
  return n;
}

function badRequest(msg) {
  const err = new Error(msg);
  err.status = 400;
  return err;
}

function conflict(msg) {
  const err = new Error(msg);
  err.status = 409;
  return err;
}

async function readCart(clientOrPool, userId) {
  const q = \`
    SELECT
      ci.id,
      ci.status,
      ci.quantity,
      p.id AS product_id,
      p.sku,
      p.name,
      p.price_cents,
      p.stock
    FROM cart_items ci
    JOIN products p ON p.id = ci.product_id
    WHERE ci.user_id = $1
    ORDER BY ci.status ASC, p.sku ASC
  \`;
  const { rows } = await clientOrPool.query(q, [userId]);

  const active = [];
  const saved = [];
  let grand_total_cents = 0;

  for (const r of rows) {
    const line_total_cents = r.price_cents * r.quantity; // integer * integer => exact
    const item = {
      id: r.id,
      status: r.status,
      quantity: r.quantity,
      product: {
        id: r.product_id,
        sku: r.sku,
        name: r.name,
        price_cents: r.price_cents,
        stock: r.stock
      },
      line_total_cents
    };

    if (r.status === "active") {
      active.push(item);
      grand_total_cents += line_total_cents;
    } else {
      saved.push(item);
    }
  }

  return { active, saved, grand_total_cents };
}

/**
 * Lock product row + relevant cart rows for safe stock validation under concurrency.
 * Returns { product, activeItemRow, savedItemRow } with FOR UPDATE locks.
 */
async function lockProductAndItems(client, userId, sku) {
  if (typeof sku !== "string" || !sku.trim()) throw badRequest("sku is required");
  const cleanSku = sku.trim();

  const prodRes = await client.query(
    \`SELECT id, sku, name, price_cents, stock
     FROM products
     WHERE sku = $1 AND is_active = TRUE
     FOR UPDATE\`,
    [cleanSku]
  );
  if (prodRes.rowCount === 0) throw badRequest("Unknown SKU");
  const product = prodRes.rows[0];

  const itemsRes = await client.query(
    \`SELECT id, status, quantity
     FROM cart_items
     WHERE user_id = $1 AND product_id = $2
     FOR UPDATE\`,
    [userId, product.id]
  );

  let activeItemRow = null;
  let savedItemRow = null;
  for (const r of itemsRes.rows) {
    if (r.status === "active") activeItemRow = r;
    if (r.status === "saved") savedItemRow = r;
  }

  return { product, activeItemRow, savedItemRow };
}

/**
 * GET /api/cart
 */
router.get("/", async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const cart = await readCart(pool, userId);
    res.json(cart);
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/cart/items
 * Body: { sku: string, qty: integer (>0), status?: 'active'|'saved' }  default active
 *
 * Requirement: merging duplicates. We enforce via partial unique index + UPSERT.
 * Stock validation: (currentActiveQty + newQty) <= stock  (only counts ACTIVE items).
 */
router.post("/items", async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { sku, qty, status } = req.body || {};
    const desiredStatus = status === "saved" ? "saved" : "active";

    const nQty = Number(qty);
    if (!Number.isInteger(nQty) || nQty <= 0) throw badRequest("qty must be an integer > 0");

    const cart = await withTx(async (client) => {
      const { product, activeItemRow } = await lockProductAndItems(client, userId, sku);

      // Stock check is always based on ACTIVE cart quantity (per requirements)
      const currentActiveQty = activeItemRow ? activeItemRow.quantity : 0;
      const newActiveQty = desiredStatus === "active" ? currentActiveQty + nQty : currentActiveQty;

      if (newActiveQty > product.stock) {
        throw conflict("Insufficient Stock");
      }

      // Insert/merge for desired status
      if (desiredStatus === "active") {
        await client.query(
          \`INSERT INTO cart_items (user_id, product_id, status, quantity)
           VALUES ($1, $2, 'active', $3)
           ON CONFLICT ON CONSTRAINT cart_items_unique_active
           DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity\`,
          [userId, product.id, nQty]
        );
      } else {
        await client.query(
          \`INSERT INTO cart_items (user_id, product_id, status, quantity)
           VALUES ($1, $2, 'saved', $3)
           ON CONFLICT ON CONSTRAINT cart_items_unique_saved
           DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity\`,
          [userId, product.id, nQty]
        );
      }

      return readCart(client, userId);
    });

    res.status(201).json(cart);
  } catch (e) {
    next(e);
  }
});

/**
 * PATCH /api/cart/items/:id
 * Body: { quantity: integer } OR { delta: integer } (delta can be negative)
 *
 * Stock validation: newActiveQty <= stock
 * quantity <= 0 -> delete the row
 */
router.patch("/items/:id", async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) throw badRequest("Invalid item id");

    const { quantity, delta } = req.body || {};
    const hasQuantity = quantity !== undefined;
    const hasDelta = delta !== undefined;
    if (hasQuantity === hasDelta) throw badRequest("Provide either quantity or delta (exactly one)");

    const cart = await withTx(async (client) => {
      // Lock the item
      const itemRes = await client.query(
        \`SELECT ci.id, ci.status, ci.quantity, ci.product_id, p.sku, p.stock
         FROM cart_items ci
         JOIN products p ON p.id = ci.product_id
         WHERE ci.id = $1 AND ci.user_id = $2
         FOR UPDATE\`,
        [id, userId]
      );
      if (itemRes.rowCount === 0) throw badRequest("Item not found");
      const item = itemRes.rows[0];

      let newQty;
      if (hasQuantity) {
        newQty = Number(quantity);
        if (!Number.isInteger(newQty)) throw badRequest("quantity must be an integer");
      } else {
        const d = Number(delta);
        if (!Number.isInteger(d)) throw badRequest("delta must be an integer");
        newQty = item.quantity + d;
      }

      // If setting to 0 or negative: delete
      if (newQty <= 0) {
        await client.query(\`DELETE FROM cart_items WHERE id = $1 AND user_id = $2\`, [id, userId]);
        return readCart(client, userId);
      }

      // Stock check only matters for ACTIVE items
      if (item.status === "active") {
        // Lock product row for concurrency-safe stock read
        const prodRes = await client.query(
          \`SELECT id, stock FROM products WHERE id = $1 FOR UPDATE\`,
          [item.product_id]
        );
        const stock = prodRes.rows[0].stock;
        if (newQty > stock) throw conflict("Insufficient Stock");
      }

      await client.query(
        \`UPDATE cart_items
         SET quantity = $1
         WHERE id = $2 AND user_id = $3\`,
        [newQty, id, userId]
      );

      return readCart(client, userId);
    });

    res.json(cart);
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/cart/items/:id/move
 * Body: { toStatus: 'active'|'saved' }
 *
 * Rules:
 * - Move item to other list
 * - If destination already has same product, merge quantities (no duplicate rows)
 * - Stock validation when moving into ACTIVE: (existingActiveQty + movedQty) <= stock
 */
router.post("/items/:id/move", async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) throw badRequest("Invalid item id");

    const toStatus = req.body?.toStatus;
    if (toStatus !== "active" && toStatus !== "saved") throw badRequest("toStatus must be 'active' or 'saved'");

    const cart = await withTx(async (client) => {
      // Lock the item row
      const itemRes = await client.query(
        \`SELECT ci.id, ci.status, ci.quantity, ci.product_id, p.sku, p.stock
         FROM cart_items ci
         JOIN products p ON p.id = ci.product_id
         WHERE ci.id = $1 AND ci.user_id = $2
         FOR UPDATE\`,
        [id, userId]
      );
      if (itemRes.rowCount === 0) throw badRequest("Item not found");

      const item = itemRes.rows[0];
      if (item.status === toStatus) return readCart(client, userId); // no-op

      // Lock product row for concurrency-safe stock validation
      await client.query(\`SELECT id FROM products WHERE id = $1 FOR UPDATE\`, [item.product_id]);

      // Lock destination row if exists
      const destRes = await client.query(
        \`SELECT id, status, quantity
         FROM cart_items
         WHERE user_id = $1 AND product_id = $2 AND status = $3
         FOR UPDATE\`,
        [userId, item.product_id, toStatus]
      );
      const dest = destRes.rowCount ? destRes.rows[0] : null;

      if (toStatus === "active") {
        // Need to ensure (existingActiveQty + movedQty) <= stock
        const activeQty = dest ? dest.quantity : 0;
        const newActiveQty = activeQty + item.quantity;

        if (newActiveQty > item.stock) throw conflict("Insufficient Stock");
      }

      if (!dest) {
        // Simple status switch
        await client.query(
          \`UPDATE cart_items SET status = $1 WHERE id = $2 AND user_id = $3\`,
          [toStatus, item.id, userId]
        );
      } else {
        // Merge into destination, delete source
        await client.query(
          \`UPDATE cart_items
           SET quantity = quantity + $1
           WHERE id = $2 AND user_id = $3\`,
          [item.quantity, dest.id, userId]
        );
        await client.query(\`DELETE FROM cart_items WHERE id = $1 AND user_id = $2\`, [item.id, userId]);
      }

      return readCart(client, userId);
    });

    res.json(cart);
  } catch (e) {
    next(e);
  }
});

/**
 * DELETE /api/cart/items/:id
 */
router.delete("/items/:id", async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) throw badRequest("Invalid item id");

    const cart = await withTx(async (client) => {
      await client.query(\`DELETE FROM cart_items WHERE id = $1 AND user_id = $2\`, [id, userId]);
      return readCart(client, userId);
    });

    res.json(cart);
  } catch (e) {
    next(e);
  }
});

module.exports = router;

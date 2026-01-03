const express = require("express");
const cors = require("cors");
const { migrateAndSeed } = require("./migrate");
const { withClient, query } = require("./db");
const { computeTotals, normalizeCode, validateCoupon } = require("./pricing");

const app = express();
app.use(cors());
app.use(express.json({ limit: "300kb" }));

const PORT = process.env.PORT || 4000;

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "promo-backend" });
});

app.get("/api/products", async (req, res) => {
  const { rows } = await query(`SELECT id, name, price_satang, stock FROM products ORDER BY id;`);
  res.json({ products: rows });
});

function normalizeItems(items) {
  const normalized = Array.isArray(items) ? items : [];
  return normalized
    .map(it => ({ productId: String(it.productId || "").trim(), qty: Number(it.qty) }))
    .filter(it => it.productId && Number.isInteger(it.qty) && it.qty > 0);
}

async function buildQuote(client, { userId, items, couponCode }, { consumeOnConfirm, autoDiscountPercent }) {
  const errors = [];
  const messages = [];

  const uid = String(userId || "").trim();
  if (!uid) errors.push("Please enter a User ID.");

  const normItems = normalizeItems(items);
  if (normItems.length === 0) errors.push("Cart is empty.");

  // Load products
  const ids = [...new Set(normItems.map(i => i.productId))];
  const { rows: products } = await client.query(
    `SELECT id, name, price_satang, stock FROM products WHERE id = ANY($1::text[])`,
    [ids]
  );

  const map = new Map(products.map(p => [p.id, p]));

  // Build line items + subtotal
  let subtotal = 0;
  const lineItems = [];

  for (const it of normItems) {
    const p = map.get(it.productId);
    if (!p) { errors.push(`Unknown product: ${it.productId}.`); continue; }
    if (it.qty > p.stock) {
      errors.push(`Out of stock: ${p.name} (available ${p.stock}).`);
    }
    const lineTotal = p.price_satang * it.qty;
    subtotal += lineTotal;
    lineItems.push({
      productId: p.id,
      name: p.name,
      price_satang: p.price_satang,
      qty: it.qty,
      stock: p.stock,
      line_total_satang: lineTotal
    });
  }

  // Coupon usage count
  const code = normalizeCode(couponCode);
  let usedCount = 0;
  if (code && uid) {
    const r = await client.query(
      `SELECT used_count FROM coupon_usage WHERE user_id=$1 AND coupon_code=$2`,
      [uid, code]
    );
    usedCount = r.rows?.[0]?.used_count ?? 0;
  }

  const { coupon, errors: couponErrors, messages: couponMessages } = validateCoupon({
    code,
    subtotal_satang: subtotal,
    userUsedCount: usedCount
  });

  errors.push(...couponErrors);
  messages.push(...couponMessages);

  const totals = computeTotals(subtotal, coupon, autoDiscountPercent);

  // Clamp coupon discount already in computeTotals, total never negative.

  // Confirm: reduce stock + consume one-time coupon usage atomically
  if (consumeOnConfirm && errors.length === 0) {
    // Lock rows and re-check stock to prevent race conditions
    const locked = await client.query(
      `SELECT id, stock, name, price_satang FROM products WHERE id = ANY($1::text[]) FOR UPDATE`,
      [ids]
    );
    const lockedMap = new Map(locked.rows.map(p => [p.id, p]));

    for (const it of normItems) {
      const p = lockedMap.get(it.productId);
      if (!p) { errors.push(`Unknown product: ${it.productId}.`); continue; }
      if (it.qty > p.stock) {
        errors.push(`Out of stock: ${p.name} (available ${p.stock}).`);
      }
    }

    if (errors.length === 0) {
      // Reduce stock
      for (const it of normItems) {
        await client.query(
          `UPDATE products SET stock = stock - $1 WHERE id=$2`,
          [it.qty, it.productId]
        );
      }

      // Consume one-time coupon usage only if coupon applied and has per_user_limit
      if (coupon && coupon.per_user_limit && totals.coupon_discount_satang > 0) {
        await client.query(
          `INSERT INTO coupon_usage (user_id, coupon_code, used_count)
           VALUES ($1, $2, 1)
           ON CONFLICT (user_id, coupon_code)
           DO UPDATE SET used_count = coupon_usage.used_count + 1`,
          [uid, coupon.code]
        );
      }
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    messages,
    userId: uid,
    items: lineItems,
    couponCode: code,
    appliedCoupon: coupon ? {
      code: coupon.code,
      amount_satang: coupon.amount_satang,
      min_subtotal_satang: coupon.min_subtotal_satang || 0,
      expires_at: coupon.expires_at,
      per_user_limit: coupon.per_user_limit
    } : null,
    pricing: totals
  };
}

app.post("/api/checkout/quote", async (req, res) => {
  const payload = req.body || {};
  const autoDiscountPercent = req.headers["x-auto-discount-percent"] !== undefined 
    ? Number(req.headers["x-auto-discount-percent"]) 
    : 10;
  const result = await withClient(async (client) => {
    return buildQuote(client, payload, { consumeOnConfirm: false, autoDiscountPercent });
  });

  res.status(result.ok ? 200 : 400).json(result);
});

app.post("/api/checkout/confirm", async (req, res) => {
  const payload = req.body || {};
  const autoDiscountPercent = req.headers["x-auto-discount-percent"] !== undefined 
    ? Number(req.headers["x-auto-discount-percent"]) 
    : 10;

  const result = await withClient(async (client) => {
    await client.query("BEGIN");
    try {
      const r = await buildQuote(client, payload, { consumeOnConfirm: true, autoDiscountPercent });
      if (!r.ok) {
        await client.query("ROLLBACK");
        return r;
      }
      await client.query("COMMIT");
      return r;
    } catch (e) {
      await client.query("ROLLBACK");
      return { ok: false, errors: ["Server error."], messages: [], userId: "", items: [], couponCode: null, appliedCoupon: null,
        pricing: { subtotal_satang: 0, auto_discount_satang: 0, subtotal_after_auto_satang: 0, coupon_discount_satang: 0, total_satang: 0 }
      };
    }
  });

  res.status(result.ok ? 200 : 400).json(result);
});

if (require.main === module) {
  migrateAndSeed()
    .then(() => {
      app.listen(PORT, () => console.log(`promo-backend listening on http://0.0.0.0:${PORT}`));
    })
    .catch((e) => {
      console.error("Failed to start:", e);
      process.exit(1);
    });
}

module.exports = { app };

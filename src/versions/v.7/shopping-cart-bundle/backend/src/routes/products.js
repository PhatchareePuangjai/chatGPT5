const express = require("express");
const { pool } = require("../db");

const router = express.Router();

router.get("/", async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      \`SELECT id, sku, name, price_cents, stock
       FROM products
       WHERE is_active = TRUE
       ORDER BY sku ASC\`
    );
    res.json({ products: rows });
  } catch (e) {
    next(e);
  }
});

module.exports = router;

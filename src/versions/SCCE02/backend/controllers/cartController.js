
const pool = require('../db');

exports.getCart = async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      `SELECT ci.id, ci.quantity, ci.status,
              p.name, p.price_cents
       FROM cart_items ci
       JOIN carts c ON ci.cart_id = c.id
       JOIN products p ON ci.product_id = p.id
       WHERE c.user_id = $1`,
      [userId]
    );

    let totalCents = 0;

    const items = result.rows.map(item => {
      const lineTotal = item.price_cents * item.quantity;
      if (item.status === "ACTIVE") totalCents += lineTotal;
      return { ...item, lineTotal };
    });

    res.json({ items, totalCents });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

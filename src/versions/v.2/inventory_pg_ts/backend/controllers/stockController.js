import { pool } from '../db/index.js';

// GET /api/stock
export const getAllStock = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, stock FROM products ORDER BY id ASC;'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching stock:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/stock/low
export const getLowStock = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, stock FROM products WHERE stock < 5 ORDER BY stock ASC;'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching low stock:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/stock/history
export const getStockHistory = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT h.id, h.product_id, p.name AS product_name,
              h.change, h.old_stock, h.new_stock,
              h.reason, h.created_at
         FROM stock_history h
         JOIN products p ON p.id = h.product_id
         ORDER BY h.created_at DESC
         LIMIT 100;`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching history:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/stock/purchase  { productId, quantity }
export const purchaseItem = async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || !quantity || quantity <= 0) {
    return res
      .status(400)
      .json({ error: 'productId and quantity (> 0) are required.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const productResult = await client.query(
      'SELECT id, name, stock FROM products WHERE id = $1 FOR UPDATE;',
      [productId]
    );

    if (productResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Product not found.' });
    }

    const product = productResult.rows[0];

    if (product.stock < quantity) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Not enough stock for this purchase.' });
    }

    const oldStock = product.stock;
    const newStock = oldStock - quantity;

    const updateResult = await client.query(
      'UPDATE products SET stock = $1 WHERE id = $2 RETURNING id, name, stock;',
      [newStock, productId]
    );
    const updatedProduct = updateResult.rows[0];

    await client.query(
      `INSERT INTO stock_history
         (product_id, change, old_stock, new_stock, reason)
       VALUES ($1, $2, $3, $4, $5);`,
      [productId, -quantity, oldStock, newStock, 'PURCHASE']
    );

    if (newStock < 5) {
      console.log(
        `[LOW STOCK] Product "${updatedProduct.name}" (ID: ${updatedProduct.id}) has low stock: ${newStock}`
      );
    }

    await client.query('COMMIT');

    return res.json({
      message: 'Purchase successful.',
      product: updatedProduct,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error in purchaseItem:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

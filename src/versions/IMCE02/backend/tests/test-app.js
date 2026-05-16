process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.POSTGRES_USER = process.env.POSTGRES_USER || 'postgres';
process.env.POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD || 'postgres';
process.env.POSTGRES_DB = process.env.POSTGRES_DB || 'inventory';

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  port: 5432,
});

app.get('/api/stock', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM products ORDER BY id');
  res.json(rows);
});

app.post('/api/stock/deduct/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    const result = await client.query(
      'SELECT stock FROM products WHERE id = $1 FOR UPDATE',
      [id]
    );
    if (result.rowCount === 0) throw new Error('Product not found');
    const stock = result.rows[0].stock;
    if (stock <= 0) throw new Error('Out of stock');
    await client.query('UPDATE products SET stock = stock - 1 WHERE id = $1', [id]);
    await client.query('COMMIT');
    res.json({ message: 'Stock deducted successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
});

app.post('/api/stock/restore/:id', async (req, res) => {
  const { id } = req.params;
  await pool.query('UPDATE products SET stock = stock + 1 WHERE id = $1', [id]);
  res.json({ message: 'Stock restored' });
});

module.exports = { app, pool };

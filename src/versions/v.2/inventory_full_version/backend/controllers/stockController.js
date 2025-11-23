import { pool } from '../db/index.js';
import {
  deductStockForOrder,
  restoreStockForOrder,
  restockProduct,
  InsufficientStockError,
} from '../services/stockService.js';

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
      'SELECT id, name, stock FROM products WHERE stock <= 5 ORDER BY stock ASC;'
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
      `SELECT h.id,
              h.product_id,
              p.name AS product_name,
              h.change,
              h.old_stock,
              h.new_stock,
              h.reason,
              h.metadata,
              h.created_at
         FROM stock_history h
         JOIN products p ON p.id = h.product_id
         ORDER BY h.created_at DESC
         LIMIT 200;`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching history:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/stock/alerts
export const getStockAlerts = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.id,
              a.product_id,
              p.name AS product_name,
              a.current_stock,
              a.threshold,
              a.type,
              a.created_at
         FROM stock_alerts a
         JOIN products p ON p.id = a.product_id
         ORDER BY a.created_at DESC
         LIMIT 200;`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching alerts:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * POST /api/stock/order/deduct
 * Body: { orderId, productId, quantity }
 * Deduct stock when an order is placed.
 */
export const deductStockController = async (req, res) => {
  const { orderId, productId, quantity } = req.body;

  try {
    const updatedProduct = await deductStockForOrder({
      orderId,
      productId,
      quantity,
    });

    res.json({
      message: 'Stock deducted for order.',
      product: updatedProduct,
    });
  } catch (err) {
    if (err instanceof InsufficientStockError) {
      return res.status(400).json({ error: err.message });
    }

    console.error('Error deducting stock for order:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * POST /api/stock/order/restore
 * Body: { orderId, productId, quantity, status }
 */
export const restoreStockController = async (req, res) => {
  const { orderId, productId, quantity, status } = req.body;

  try {
    const updatedProduct = await restoreStockForOrder({
      orderId,
      productId,
      quantity,
      status,
    });

    res.json({
      message: `Stock restored for order (${status || 'CANCELLED'}).`,
      product: updatedProduct,
    });
  } catch (err) {
    console.error('Error restoring stock for order:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * POST /api/stock/restock
 * Body: { productId, quantity, reason?, metadata? }
 */
export const restockController = async (req, res) => {
  const { productId, quantity, reason, metadata } = req.body;

  try {
    const updatedProduct = await restockProduct({
      productId,
      quantity,
      reason,
      metadata,
    });

    res.json({
      message: 'Product restocked.',
      product: updatedProduct,
    });
  } catch (err) {
    console.error('Error restocking product:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

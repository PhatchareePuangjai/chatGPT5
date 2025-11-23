import { pool } from '../db/index.js';

const LOW_STOCK_THRESHOLD = 5;

// Custom error for overselling attempts
export class InsufficientStockError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InsufficientStockError';
  }
}

/**
 * Internal helper:
 *  - Locks product row
 *  - Applies delta (can be + or -)
 *  - Prevents stock < 0
 *  - Writes audit log
 *  - Emits low-stock alert if needed
 */
async function updateStockWithAudit(client, {
  productId,
  delta,
  reason,
  metadata = {},
}) {
  // Lock row to prevent race conditions
  const productResult = await client.query(
    'SELECT id, name, stock FROM products WHERE id = $1 FOR UPDATE;',
    [productId]
  );

  if (productResult.rowCount === 0) {
    throw new Error(`Product ${productId} not found`);
  }

  const product = productResult.rows[0];
  const oldStock = product.stock;
  const newStock = oldStock + delta;

  // Never allow stock to go below zero
  if (newStock < 0) {
    throw new InsufficientStockError(
      `Not enough stock: current=${oldStock}, requested change=${delta}`
    );
  }

  // Update stock
  const updateResult = await client.query(
    'UPDATE products SET stock = $1 WHERE id = $2 RETURNING id, name, stock;',
    [newStock, productId]
  );
  const updatedProduct = updateResult.rows[0];

  // Audit log entry
  await client.query(
    `INSERT INTO stock_history
       (product_id, change, old_stock, new_stock, reason, metadata)
     VALUES ($1, $2, $3, $4, $5, $6);`,
    [productId, delta, oldStock, newStock, reason, metadata]
  );

  // Low stock alert (<= threshold)
  if (newStock <= LOW_STOCK_THRESHOLD) {
    console.log(
      `[LOW STOCK ALERT] Product "${updatedProduct.name}" (ID: ${updatedProduct.id}) is low: ${newStock} (<= ${LOW_STOCK_THRESHOLD})`
    );

    await client.query(
      `INSERT INTO stock_alerts (product_id, current_stock, threshold, type)
       VALUES ($1, $2, $3, $4);`,
      [productId, newStock, LOW_STOCK_THRESHOLD, 'LOW_STOCK']
    );
  }

  return updatedProduct;
}

/**
 * Deduct stock when an order is placed and paid successfully.
 * Uses reason 'SALE' to match acceptance scenarios.
 */
export async function deductStockForOrder({
  orderId,
  productId,
  quantity,
}) {
  if (!orderId || !productId || !quantity || quantity <= 0) {
    throw new Error('orderId, productId and quantity (>0) are required');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const updatedProduct = await updateStockWithAudit(client, {
      productId,
      delta: -quantity,
      reason: 'SALE',
      metadata: { orderId, quantity },
    });

    await client.query('COMMIT');
    return updatedProduct;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Restore stock when an order is cancelled or fails.
 * Uses reason 'RESTOCK/RETURN' to match acceptance scenarios.
 */
export async function restoreStockForOrder({
  orderId,
  productId,
  quantity,
  status = 'CANCELLED',
}) {
  if (!orderId || !productId || !quantity || quantity <= 0) {
    throw new Error('orderId, productId and quantity (>0) are required');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const updatedProduct = await updateStockWithAudit(client, {
      productId,
      delta: quantity,
      reason: 'RESTOCK/RETURN',
      metadata: { orderId, quantity, status },
    });

    await client.query('COMMIT');
    return updatedProduct;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Manual restock / returns / admin adjustments.
 */
export async function restockProduct({
  productId,
  quantity,
  reason = 'MANUAL_RESTOCK',
  metadata = {},
}) {
  if (!productId || !quantity || quantity <= 0) {
    throw new Error('productId and quantity (>0) are required');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const updatedProduct = await updateStockWithAudit(client, {
      productId,
      delta: quantity,
      reason,
      metadata,
    });

    await client.query('COMMIT');
    return updatedProduct;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

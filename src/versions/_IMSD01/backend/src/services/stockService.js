const { withTransaction } = require('../db');
const inventoryRepository = require('../repositories/inventoryRepository');
const inventoryLogRepository = require('../repositories/inventoryLogRepository');
const stockAlertRepository = require('../repositories/stockAlertRepository');
const orderReservationRepository = require('../repositories/orderReservationRepository');
const { logInfo } = require('../utils/logger');

const STOCK_CHANGE_TYPES = {
  SALE: 'SALE',
  RESTOCK_RETURN: 'RESTOCK_RETURN',
};

const deductStock = async ({ sku, quantity, orderId }) =>
  withTransaction(async (client) => {
    const item = await inventoryRepository.getBySku(client, sku, true);
    if (!item) {
      const error = new Error('SKU not found.');
      error.status = 404;
      error.code = 'sku_not_found';
      throw error;
    }

    if (quantity > item.quantity) {
      const error = new Error('Insufficient stock.');
      error.status = 409;
      error.code = 'insufficient_stock';
      throw error;
    }

    const newQuantity = item.quantity - quantity;
    const updated = await inventoryRepository.updateQuantity(
      client,
      sku,
      newQuantity
    );

    const log = await inventoryLogRepository.createLog(client, {
      sku,
      changeType: STOCK_CHANGE_TYPES.SALE,
      quantityDelta: -quantity,
      orderId,
    });

    if (updated.quantity <= updated.low_stock_threshold) {
      await stockAlertRepository.createAlert(client, {
        sku,
        threshold: updated.low_stock_threshold,
        quantity: updated.quantity,
      });
      logInfo('Low stock alert created', {
        sku,
        quantity: updated.quantity,
        threshold: updated.low_stock_threshold,
      });
    }

    logInfo('Stock deducted', {
      sku,
      quantity,
      newQuantity: updated.quantity,
      orderId,
    });

    return { updated, logId: log.id };
  });

const restoreStock = async ({ sku, quantity, orderId, reason }) =>
  withTransaction(async (client) => {
    const item = await inventoryRepository.getBySku(client, sku, true);
    if (!item) {
      const error = new Error('SKU not found.');
      error.status = 404;
      error.code = 'sku_not_found';
      throw error;
    }

    const newQuantity = item.quantity + quantity;
    const updated = await inventoryRepository.updateQuantity(
      client,
      sku,
      newQuantity
    );

    const log = await inventoryLogRepository.createLog(client, {
      sku,
      changeType: STOCK_CHANGE_TYPES.RESTOCK_RETURN,
      quantityDelta: quantity,
      orderId,
    });

    await orderReservationRepository.upsertReservation(client, {
      id: orderId,
      sku,
      quantity,
      status: reason === 'expired' ? 'EXPIRED' : 'CANCELED',
    });

    logInfo('Stock restored', {
      sku,
      quantity,
      newQuantity: updated.quantity,
      orderId,
      reason,
    });

    return { updated, logId: log.id };
  });

module.exports = {
  deductStock,
  restoreStock,
  STOCK_CHANGE_TYPES,
};

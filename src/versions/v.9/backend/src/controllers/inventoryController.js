const inventoryRepository = require('../repositories/inventoryRepository');
const { pool } = require('../db');
const stockService = require('../services/stockService');
const stockAlertRepository = require('../repositories/stockAlertRepository');
const {
  validateOrderId,
  validateQuantity,
  validateRestoreReason,
} = require('../validators/inventoryValidators');
const { toSuccessResponse } = require('../utils/apiResponse');

const getInventory = async (req, res, next) => {
  try {
    const { sku } = req.params;
    const item = await inventoryRepository.getBySku(pool, sku);
    if (!item) {
      const error = new Error('SKU not found.');
      error.status = 404;
      error.code = 'sku_not_found';
      throw error;
    }
    res.json(toSuccessResponse(item));
  } catch (error) {
    next(error);
  }
};

const searchInventory = async (req, res, next) => {
  try {
    const query = (req.query.query || '').trim();
    if (!query) {
      return res.json(toSuccessResponse([]));
    }
    const skus = await inventoryRepository.searchBySku(pool, query, 10);
    return res.json(toSuccessResponse(skus));
  } catch (error) {
    return next(error);
  }
};

const deductStock = async (req, res, next) => {
  try {
    const { sku } = req.params;
    const { quantity, order_id: orderId } = req.body;

    validateQuantity(quantity);
    validateOrderId(orderId);

    const result = await stockService.deductStock({ sku, quantity, orderId });
    res.json(
      toSuccessResponse({
        sku,
        new_quantity: result.updated.quantity,
        log_id: result.logId,
      })
    );
  } catch (error) {
    next(error);
  }
};

const restoreStock = async (req, res, next) => {
  try {
    const { sku } = req.params;
    const { quantity, order_id: orderId, reason } = req.body;

    validateQuantity(quantity);
    validateOrderId(orderId);
    validateRestoreReason(reason);

    const result = await stockService.restoreStock({
      sku,
      quantity,
      orderId,
      reason,
    });
    res.json(
      toSuccessResponse({
        sku,
        new_quantity: result.updated.quantity,
        log_id: result.logId,
      })
    );
  } catch (error) {
    next(error);
  }
};

const getAlerts = async (req, res, next) => {
  try {
    const { sku } = req.params;
    const alerts = await stockAlertRepository.listAlerts(pool, sku);
    res.json(toSuccessResponse(alerts));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInventory,
  searchInventory,
  deductStock,
  restoreStock,
  getAlerts,
};

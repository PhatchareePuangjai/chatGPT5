const validateQuantity = (quantity) => {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    const error = new Error('Quantity must be a positive integer.');
    error.status = 400;
    error.code = 'invalid_quantity';
    throw error;
  }
};

const validateOrderId = (orderId) => {
  if (!orderId || typeof orderId !== 'string') {
    const error = new Error('order_id is required.');
    error.status = 400;
    error.code = 'invalid_order_id';
    throw error;
  }
};

const validateRestoreReason = (reason) => {
  if (!['canceled', 'expired'].includes(reason)) {
    const error = new Error('reason must be canceled or expired.');
    error.status = 400;
    error.code = 'invalid_restore_reason';
    throw error;
  }
};

module.exports = {
  validateQuantity,
  validateOrderId,
  validateRestoreReason,
};

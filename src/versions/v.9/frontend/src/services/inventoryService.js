import { get, post } from './apiClient';

const getInventory = (sku) => get(`/inventory/${sku}`);

const deductStock = ({ sku, quantity, orderId }) =>
  post(`/inventory/${sku}/deduct`, {
    quantity,
    order_id: orderId,
  });

const getAlerts = (sku) => get(`/inventory/${sku}/alerts`);

const restoreStock = ({ sku, quantity, orderId, reason }) =>
  post(`/inventory/${sku}/restore`, {
    quantity,
    order_id: orderId,
    reason,
  });

const searchSkus = (query) => get(`/inventory?query=${encodeURIComponent(query)}`);

export { getInventory, deductStock, getAlerts, restoreStock, searchSkus };

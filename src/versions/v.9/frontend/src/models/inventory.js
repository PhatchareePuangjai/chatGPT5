export const toInventoryView = (item) => ({
  sku: item.sku,
  quantity: item.quantity,
  lowStockThreshold: item.low_stock_threshold,
});

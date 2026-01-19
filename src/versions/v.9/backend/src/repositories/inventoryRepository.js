const getBySku = async (client, sku, forUpdate = false) => {
  const lockClause = forUpdate ? 'FOR UPDATE' : '';
  const result = await client.query(
    `SELECT sku, quantity, low_stock_threshold, updated_at FROM inventory_items WHERE sku = $1 ${lockClause}`,
    [sku]
  );
  return result.rows[0] || null;
};

const updateQuantity = async (client, sku, newQuantity) => {
  const result = await client.query(
    'UPDATE inventory_items SET quantity = $1, updated_at = NOW() WHERE sku = $2 RETURNING sku, quantity, low_stock_threshold, updated_at',
    [newQuantity, sku]
  );
  return result.rows[0];
};

const searchBySku = async (client, query, limit = 10) => {
  const result = await client.query(
    'SELECT sku FROM inventory_items WHERE sku ILIKE $1 ORDER BY sku ASC LIMIT $2',
    [`%${query}%`, limit]
  );
  return result.rows.map((row) => row.sku);
};

module.exports = {
  getBySku,
  updateQuantity,
  searchBySku,
};

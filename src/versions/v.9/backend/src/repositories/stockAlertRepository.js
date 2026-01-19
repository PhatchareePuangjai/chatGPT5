const createAlert = async (client, { sku, threshold, quantity }) => {
  const result = await client.query(
    'INSERT INTO stock_alerts (sku, threshold, quantity) VALUES ($1, $2, $3) RETURNING id, sku, threshold, quantity, status, created_at',
    [sku, threshold, quantity]
  );
  return result.rows[0];
};

const listAlerts = async (client, sku) => {
  const result = await client.query(
    'SELECT id, sku, threshold, quantity, status, created_at FROM stock_alerts WHERE sku = $1 ORDER BY created_at DESC',
    [sku]
  );
  return result.rows;
};

module.exports = {
  createAlert,
  listAlerts,
};

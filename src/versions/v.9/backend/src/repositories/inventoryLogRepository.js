const createLog = async (client, { sku, changeType, quantityDelta, orderId }) => {
  const result = await client.query(
    'INSERT INTO inventory_logs (sku, change_type, quantity_delta, order_id) VALUES ($1, $2, $3, $4) RETURNING id',
    [sku, changeType, quantityDelta, orderId]
  );
  return result.rows[0];
};

module.exports = {
  createLog,
};

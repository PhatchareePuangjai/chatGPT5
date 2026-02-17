const upsertReservation = async (client, { id, sku, quantity, status }) => {
  const result = await client.query(
    `INSERT INTO order_reservations (id, sku, quantity, status)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (id)
     DO UPDATE SET status = EXCLUDED.status
     RETURNING id, sku, quantity, status`,
    [id, sku, quantity, status]
  );
  return result.rows[0];
};

module.exports = {
  upsertReservation,
};

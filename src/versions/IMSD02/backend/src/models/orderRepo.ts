import type pg from "pg";
import { ApiError } from "../api/middleware/errorHandler.js";

export type OrderRow = {
  id: number;
  status: string;
};

export async function getOrderById(client: pg.PoolClient, id: number): Promise<OrderRow> {
  const res = await client.query("SELECT id, status FROM orders WHERE id = $1", [id]);
  if (!res.rowCount) {
    throw new ApiError({ status: 404, code: "ORDER_NOT_FOUND", message: "Order not found" });
  }
  return res.rows[0] as OrderRow;
}

export async function updateOrderStatus(client: pg.PoolClient, id: number, status: string) {
  await client.query("UPDATE orders SET status = $2, updated_at = NOW() WHERE id = $1", [id, status]);
}

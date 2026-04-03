const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000";

type Envelope<T> = {
  status: "success" | "error";
  data: T | null;
  error: string | null;
};

export type PurchasePayload = {
  order_id: string;
  product_id: string;
  sku: string;
  quantity: number;
};

export type CancelPayload = {
  order_id: string;
  product_id: string;
  sku: string;
  quantity: number;
  reason: "cancelled" | "expired";
};

export async function purchase(payload: PurchasePayload) {
  const resp = await fetch(`${API_BASE}/inventory/purchase`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = (await resp.json()) as Envelope<Record<string, unknown>>;
  return { ok: resp.ok, body };
}

export async function cancel(payload: CancelPayload) {
  const resp = await fetch(`${API_BASE}/inventory/cancel`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = (await resp.json()) as Envelope<Record<string, unknown>>;
  return { ok: resp.ok, body };
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export async function createOrder({ userId, original_total_satang }) {
  const r = await fetch(`${API_BASE_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, original_total_satang }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.message || data.error || "Failed to create order");
  return data;
}

export async function applyCoupon({ userId, orderId, couponCode }) {
  const r = await fetch(`${API_BASE_URL}/api/apply-coupon`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, orderId, couponCode }),
  });
  const data = await r.json();
  if (!r.ok) {
    const msg = data.message || data.error || "Failed to apply coupon";
    const err = new Error(msg);
    err.code = data.error || "ERROR";
    err.payload = data;
    throw err;
  }
  return data;
}

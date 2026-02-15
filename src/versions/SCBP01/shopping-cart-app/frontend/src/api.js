const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error || "Request failed";
    const err = new Error(msg);
    err.status = res.status;
    err.details = data?.details;
    throw err;
  }
  return data;
}

export const api = {
  getProducts: () => request("/api/products"),
  getCart: () => request("/api/cart"),
  addItem: (productId, qty = 1) =>
    request("/api/cart/items", { method: "POST", body: JSON.stringify({ productId, qty }) }),
  updateQty: (productId, qty) =>
    request(`/api/cart/items/${productId}`, { method: "PATCH", body: JSON.stringify({ qty }) }),
  saveForLater: (productId, saved) =>
    request(`/api/cart/items/${productId}/save`, { method: "POST", body: JSON.stringify({ saved }) }),
  removeItem: (productId) =>
    request(`/api/cart/items/${productId}`, { method: "DELETE" }),
};

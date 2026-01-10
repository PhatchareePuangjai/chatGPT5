const USER_ID = 1; // demo; replace with real auth in production

async function apiFetch(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-User-Id": String(USER_ID),
      ...(options.headers || {})
    }
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error || `Request failed (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  getProducts: () => apiFetch("/api/products"),
  getCart: () => apiFetch("/api/cart"),
  addItem: ({ sku, qty, status }) =>
    apiFetch("/api/cart/items", { method: "POST", body: JSON.stringify({ sku, qty, status }) }),
  patchItem: (id, payload) =>
    apiFetch(`/api/cart/items/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  moveItem: (id, toStatus) =>
    apiFetch(`/api/cart/items/${id}/move`, { method: "POST", body: JSON.stringify({ toStatus }) }),
  deleteItem: (id) =>
    apiFetch(`/api/cart/items/${id}`, { method: "DELETE" })
};

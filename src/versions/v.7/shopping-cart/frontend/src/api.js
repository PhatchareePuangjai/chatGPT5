// frontend/src/api.js
async function jsonFetch(url, options) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.ok === false) {
    const err = new Error(data?.message || `Request failed: ${res.status}`);
    err.code = data?.code || "HTTP_ERROR";
    err.details = data;
    throw err;
  }
  return data;
}

export const api = {
  getProducts: () => jsonFetch("/api/products"),
  getCart: () => jsonFetch("/api/cart"),

  addItem: (sku, quantity) =>
    jsonFetch("/api/cart/items", { method: "POST", body: JSON.stringify({ sku, quantity }) }),

  setQty: (sku, quantity) =>
    jsonFetch(`/api/cart/items/${encodeURIComponent(sku)}`, {
      method: "PATCH",
      body: JSON.stringify({ quantity })
    }),

  toggleSaved: (sku, saved) =>
    jsonFetch(`/api/cart/items/${encodeURIComponent(sku)}/toggle-save`, {
      method: "POST",
      body: JSON.stringify({ saved })
    }),

  checkout: () => jsonFetch("/api/cart/checkout", { method: "POST" })
};

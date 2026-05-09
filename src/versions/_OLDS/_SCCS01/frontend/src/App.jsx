import React, { useEffect, useMemo, useState } from "react";
import { api } from "./api";
import { formatMoneyCents } from "./money";

const CART_ID_KEY = "cart_id_v1";

function getCartId() {
  return window.localStorage.getItem(CART_ID_KEY);
}

function setCartId(id) {
  window.localStorage.setItem(CART_ID_KEY, id);
}

export default function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [addQty, setAddQty] = useState({});

  const grandTotal = useMemo(() => formatMoneyCents(cart?.grand_total_cents ?? 0), [cart]);

  async function refreshCart(cartId) {
    const c = await api(`/api/carts/${cartId}`);
    setCart(c);
  }

  async function ensureCart() {
    const existing = getCartId();
    if (existing) {
      try {
        await refreshCart(existing);
        return existing;
      } catch (e) {
        window.localStorage.removeItem(CART_ID_KEY);
      }
    }
    const created = await api("/api/carts", { method: "POST" });
    setCartId(created.id);
    setCart(created);
    return created.id;
  }

  useEffect(() => {
    (async () => {
      try {
        setBusy(true);
        const [ps] = await Promise.all([api("/api/products"), ensureCart()]);
        setProducts(ps);
      } catch (e) {
        setError(e.message || "Failed to load");
      } finally {
        setBusy(false);
      }
    })();
  }, []);

  async function run(action) {
    setError("");
    setBusy(true);
    try {
      const cartId = await ensureCart();
      const updated = await action(cartId);
      if (updated) setCart(updated);
      else await refreshCart(cartId);
    } catch (e) {
      setError(e.message || "Action failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page">
      <header className="header">
        <div>
          <div className="title">Shopping Cart</div>
          <div className="subtitle">Scenarios: merge SKU, quantity update, save for later, stock checks, exact cents</div>
        </div>
        <div className="pill">
          Grand Total: <strong>{grandTotal}</strong>
        </div>
      </header>

      {error ? <div className="error">{error}</div> : null}

      <div className="grid">
        <section className="card">
          <h2>Products</h2>
          {products.length === 0 ? <div className="muted">No products</div> : null}
          <div className="list">
            {products.map((p) => {
              const qty = addQty[p.sku] ?? 1;
              return (
                <div key={p.sku} className="row">
                  <div className="rowMain">
                    <div className="rowTitle">{p.name}</div>
                    <div className="muted">
                      SKU <code>{p.sku}</code> • Price <strong>{formatMoneyCents(p.price_cents)}</strong> • Stock{" "}
                      <strong>{p.stock_qty}</strong>
                    </div>
                  </div>
                  <div className="rowActions">
                    <input
                      className="input"
                      type="number"
                      min="1"
                      value={qty}
                      onChange={(e) => setAddQty((s) => ({ ...s, [p.sku]: Math.max(1, Number(e.target.value || 1)) }))}
                      disabled={busy}
                    />
                    <button
                      className="button"
                      disabled={busy}
                      onClick={() =>
                        run((cartId) => api(`/api/carts/${cartId}/items`, { method: "POST", body: { sku: p.sku, quantity: qty } }))
                      }
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="card">
          <h2>Cart</h2>
          {!cart ? <div className="muted">Loading cart…</div> : null}
          {cart && cart.active_items.length === 0 ? <div className="muted">No active items</div> : null}
          <div className="list">
            {cart?.active_items.map((it) => (
              <div key={it.id} className="row">
                <div className="rowMain">
                  <div className="rowTitle">
                    {it.name} <span className="tag">ACTIVE</span>
                  </div>
                  <div className="muted">
                    <code>{it.sku}</code> • Unit <strong>{formatMoneyCents(it.price_cents)}</strong> • Line Total{" "}
                    <strong>{formatMoneyCents(it.line_total_cents)}</strong>
                  </div>
                </div>
                <div className="rowActions">
                  <input
                    className="input"
                    type="number"
                    min="1"
                    value={it.quantity}
                    disabled={busy}
                    onChange={(e) => {
                      const q = Math.max(1, Number(e.target.value || 1));
                      run((cartId) => api(`/api/carts/${cartId}/items/${it.id}`, { method: "PATCH", body: { quantity: q } }));
                    }}
                  />
                  <button
                    className="button secondary"
                    disabled={busy}
                    onClick={() => run((cartId) => api(`/api/carts/${cartId}/items/${it.id}/save`, { method: "POST" }))}
                  >
                    Save for Later
                  </button>
                  <button
                    className="button danger"
                    disabled={busy}
                    onClick={() => run((cartId) => api(`/api/carts/${cartId}/items/${it.id}`, { method: "DELETE" }))}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <h2 className="mt">Saved for Later</h2>
          {cart && cart.saved_items.length === 0 ? <div className="muted">No saved items</div> : null}
          <div className="list">
            {cart?.saved_items.map((it) => (
              <div key={it.id} className="row">
                <div className="rowMain">
                  <div className="rowTitle">
                    {it.name} <span className="tag mutedTag">SAVED</span>
                  </div>
                  <div className="muted">
                    <code>{it.sku}</code> • Qty <strong>{it.quantity}</strong> • Line Total{" "}
                    <strong>{formatMoneyCents(it.line_total_cents)}</strong>
                  </div>
                </div>
                <div className="rowActions">
                  <button
                    className="button"
                    disabled={busy}
                    onClick={() => run((cartId) => api(`/api/carts/${cartId}/items/${it.id}/activate`, { method: "POST" }))}
                  >
                    Move to Cart
                  </button>
                  <button
                    className="button danger"
                    disabled={busy}
                    onClick={() => run((cartId) => api(`/api/carts/${cartId}/items/${it.id}`, { method: "DELETE" }))}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <footer className="footer">
        {busy ? <span className="muted">Working…</span> : <span className="muted">Ready</span>}
      </footer>
    </div>
  );
}


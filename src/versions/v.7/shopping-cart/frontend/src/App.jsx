import React, { useEffect, useMemo, useState } from "react";
import { api } from "./api";
import { formatCents } from "./money";

function calcActiveSubtotalCents(items) {
  return items
    .filter((i) => i.status === "ACTIVE")
    .reduce((sum, i) => sum + i.quantity * i.price_cents, 0);
}

function calcSavedTotalCents(items) {
  return items
    .filter((i) => i.status === "SAVED")
    .reduce((sum, i) => sum + i.quantity * i.price_cents, 0);
}

export default function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({ items: [], totals: { active_subtotal_cents: 0, saved_total_cents: 0 } });
  const [error, setError] = useState("");
  const [busySku, setBusySku] = useState(null);
  const [checkoutMsg, setCheckoutMsg] = useState("");

  const activeSubtotal = useMemo(() => calcActiveSubtotalCents(cart.items), [cart.items]);
  const savedTotal = useMemo(() => calcSavedTotalCents(cart.items), [cart.items]);

  async function refresh() {
    const [p, c] = await Promise.all([api.getProducts(), api.getCart()]);
    setProducts(p.products);
    setCart(c.cart);
  }

  useEffect(() => {
    refresh().catch((e) => setError(e.message));
  }, []);

  function setCartFromServer(nextCart) {
    setCart(nextCart);
    setError("");
  }

  // Optimistic update helper (instant UI) with rollback if server rejects.
  async function optimisticCartUpdate(updater, serverCall) {
    const prev = cart;
    const next = updater(prev);
    setCart(next);
    setError("");
    try {
      const data = await serverCall();
      setCartFromServer(data.cart);
    } catch (e) {
      setCart(prev); // rollback
      setError(
        e.code === "INSUFFICIENT_STOCK"
          ? `Insufficient Stock (max allowed: ${e.details?.maxQty ?? e.details?.maxAddQty ?? "?"})`
          : e.message
      );
    }
  }

  async function addToCart(sku, qty) {
    setBusySku(sku);
    setCheckoutMsg("");
    try {
      // optimistic merge (if exists) and set ACTIVE
      await optimisticCartUpdate(
        (prev) => {
          const items = [...prev.items];
          const idx = items.findIndex((x) => x.sku === sku);
          if (idx >= 0) {
            items[idx] = { ...items[idx], quantity: items[idx].quantity + qty, status: "ACTIVE" };
          } else {
            const p = products.find((x) => x.sku === sku);
            if (p) items.push({ sku, name: p.name, price_cents: p.price_cents, stock: p.stock, quantity: qty, status: "ACTIVE" });
          }
          return { ...prev, items };
        },
        () => api.addItem(sku, qty)
      );
    } finally {
      setBusySku(null);
    }
  }

  async function setQty(sku, newQty) {
    setBusySku(sku);
    setCheckoutMsg("");
    try {
      await optimisticCartUpdate(
        (prev) => {
          const items = prev.items
            .map((i) => (i.sku === sku ? { ...i, quantity: newQty } : i))
            .filter((i) => i.quantity > 0); // UI mirrors backend delete-on-0
          return { ...prev, items };
        },
        () => api.setQty(sku, newQty)
      );
    } finally {
      setBusySku(null);
    }
  }

  async function toggleSaved(sku, saved) {
    setBusySku(sku);
    setCheckoutMsg("");
    try {
      await optimisticCartUpdate(
        (prev) => {
          const items = prev.items.map((i) => (i.sku === sku ? { ...i, status: saved ? "SAVED" : "ACTIVE" } : i));
          return { ...prev, items };
        },
        () => api.toggleSaved(sku, saved)
      );
    } finally {
      setBusySku(null);
    }
  }

  async function checkout() {
    setCheckoutMsg("");
    setError("");
    try {
      const r = await api.checkout();
      setCheckoutMsg(`Checkout successful. Total paid: $${formatCents(r.total_cents)}`);
      await refresh();
    } catch (e) {
      setError(e.code === "INSUFFICIENT_STOCK" ? `Checkout failed: Insufficient Stock for ${e.details?.sku}` : e.message);
    }
  }

  const activeItems = cart.items.filter((i) => i.status === "ACTIVE");
  const savedItems = cart.items.filter((i) => i.status === "SAVED");

  return (
    <div className="container">
      <header className="header">
        <h1>Shopping Cart (Precise Cents + Stock Guard)</h1>
        <p className="muted">
          Money is computed in <b>integer cents</b> to avoid floating-point issues (e.g., 19.99 × 3 = 59.97 exactly).
        </p>
      </header>

      {error ? <div className="alert error">{error}</div> : null}
      {checkoutMsg ? <div className="alert ok">{checkoutMsg}</div> : null}

      <div className="grid">
        <section className="card">
          <h2>Products</h2>
          <table className="table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Name</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Add</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.sku}>
                  <td className="mono">{p.sku}</td>
                  <td>{p.name}</td>
                  <td>${formatCents(p.price_cents)}</td>
                  <td>{p.stock}</td>
                  <td>
                    <button
                      className="btn"
                      disabled={busySku === p.sku}
                      onClick={() => addToCart(p.sku, 1)}
                      title="Add 1 (merges by SKU)"
                    >
                      + Add 1
                    </button>
                    <button
                      className="btn secondary"
                      disabled={busySku === p.sku}
                      onClick={() => addToCart(p.sku, 2)}
                      title="Add 2 (merges by SKU)"
                      style={{ marginLeft: 8 }}
                    >
                      + Add 2
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="muted">No products loaded.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </section>

        <section className="card">
          <h2>Cart</h2>

          <div className="totals">
            <div>
              <div className="muted">ACTIVE Subtotal</div>
              <div className="big">${formatCents(activeSubtotal)}</div>
            </div>
            <div>
              <div className="muted">SAVED Total (excluded from checkout)</div>
              <div className="big">${formatCents(savedTotal)}</div>
            </div>
            <div className="checkout">
              <button className="btn primary" onClick={checkout} disabled={activeItems.length === 0}>
                Checkout ACTIVE
              </button>
            </div>
          </div>

          <h3>ACTIVE Items</h3>
          <CartTable
            items={activeItems}
            busySku={busySku}
            onDec={(sku, q) => setQty(sku, Math.max(0, q - 1))}
            onInc={(sku, q) => setQty(sku, q + 1)}
            onSetQty={setQty}
            onToggleSaved={(sku) => toggleSaved(sku, true)}
          />

          <h3 style={{ marginTop: 24 }}>Saved for Later</h3>
          <CartTable
            items={savedItems}
            busySku={busySku}
            onDec={(sku, q) => setQty(sku, Math.max(0, q - 1))}
            onInc={(sku, q) => setQty(sku, q + 1)}
            onSetQty={setQty}
            onToggleSaved={(sku) => toggleSaved(sku, false)}
            saved
          />
        </section>
      </div>
    </div>
  );
}

function CartTable({ items, busySku, onDec, onInc, onSetQty, onToggleSaved, saved = false }) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>SKU</th>
          <th>Name</th>
          <th>Price</th>
          <th style={{ width: 180 }}>Qty</th>
          <th>Line Total</th>
          <th style={{ width: 180 }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {items.map((i) => (
          <tr key={i.sku}>
            <td className="mono">{i.sku}</td>
            <td>{i.name}</td>
            <td>${formatCents(i.price_cents)}</td>
            <td>
              <div className="qty">
                <button className="btn small" disabled={busySku === i.sku} onClick={() => onDec(i.sku, i.quantity)}>-</button>
                <input
                  className="input"
                  value={i.quantity}
                  disabled={busySku === i.sku}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (Number.isInteger(v) && v >= 0) onSetQty(i.sku, v);
                  }}
                />
                <button className="btn small" disabled={busySku === i.sku} onClick={() => onInc(i.sku, i.quantity)}>+</button>
              </div>
              <div className="muted tiny">Stock: {i.stock}</div>
            </td>
            <td>${formatCents(i.quantity * i.price_cents)}</td>
            <td>
              <button className="btn secondary" disabled={busySku === i.sku} onClick={() => onToggleSaved(i.sku)}>
                {saved ? "Move to Cart" : "Save for Later"}
              </button>
              <button
                className="btn danger"
                disabled={busySku === i.sku}
                onClick={() => onSetQty(i.sku, 0)}
                style={{ marginLeft: 8 }}
              >
                Remove
              </button>
            </td>
          </tr>
        ))}
        {items.length === 0 ? (
          <tr>
            <td colSpan={6} className="muted">{saved ? "No saved items." : "No active items."}</td>
          </tr>
        ) : null}
      </tbody>
    </table>
  );
}

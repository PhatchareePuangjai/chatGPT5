import React, { useEffect, useMemo, useState } from "react";
import { api } from "./api";
import { formatCents } from "./money";

function Button({ children, onClick, disabled, variant = "primary" }) {
  return (
    <button className={`btn ${variant}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

function QtyControl({ qty, onDec, onInc, disabledDec, disabledInc }) {
  return (
    <div className="qty">
      <Button variant="secondary" onClick={onDec} disabled={disabledDec}>−</Button>
      <span className="qtyValue">{qty}</span>
      <Button variant="secondary" onClick={onInc} disabled={disabledInc}>+</Button>
    </div>
  );
}

export default function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const productById = useMemo(() => {
    const m = new Map();
    for (const p of products) m.set(p.id, p);
    return m;
  }, [products]);

  async function refreshAll() {
    setError("");
    const [p, c] = await Promise.all([api.getProducts(), api.getCart()]);
    setProducts(p.products);
    setCart(c);
  }

  useEffect(() => {
    refreshAll().catch(e => setError(e.message));
  }, []);

  async function doAction(fn) {
    setBusy(true);
    setError("");
    try {
      const updated = await fn();
      // Some endpoints already return the cart
      if (updated?.cartId) setCart(updated);
      else await refreshAll();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (!cart) {
    return (
      <div className="container">
        <h1>Shopping Cart</h1>
        <p>Loading…</p>
        {error ? <div className="error">{error}</div> : null}
      </div>
    );
  }

  const subtotal = cart?.totals?.subtotal_cents ?? 0;

  return (
    <div className="container">
      <header className="header">
        <h1>Shopping Cart</h1>
        <div className="pill">Active items: {cart.totals.item_count}</div>
      </header>

      {error ? <div className="error">{error}</div> : null}

      <section className="grid">
        <div className="card">
          <h2>Products</h2>
          <p className="muted">Click “Add to cart”. Stock is checked on the server.</p>

          <div className="list">
            {products.map((p) => (
              <div key={p.id} className="row">
                <div className="rowMain">
                  <div className="title">{p.name}</div>
                  <div className="muted small">
                    SKU: {p.sku} • Price: {formatCents(p.price_cents)} • Stock: {p.stock}
                  </div>
                </div>
                <Button
                  onClick={() => doAction(() => api.addItem(p.id, 1))}
                  disabled={busy || p.stock <= 0}
                >
                  Add to cart
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2>Your cart</h2>

          {cart.items.length === 0 ? (
            <p className="muted">Your cart is empty.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th style={{ width: 160 }}>Quantity</th>
                  <th style={{ width: 120 }}>Price</th>
                  <th style={{ width: 190 }}></th>
                </tr>
              </thead>
              <tbody>
                {cart.items.map((it) => {
                  const product = productById.get(it.product_id);
                  const stock = product?.stock ?? 0;
                  const line = it.unit_price_cents * it.qty;

                  return (
                    <tr key={it.product_id}>
                      <td>
                        <div className="title">{it.name}</div>
                        <div className="muted small">SKU: {it.sku}</div>
                      </td>
                      <td>
                        <QtyControl
                          qty={it.qty}
                          onDec={() => doAction(() => api.updateQty(it.product_id, it.qty - 1))}
                          onInc={() => doAction(() => api.updateQty(it.product_id, it.qty + 1))}
                          disabledDec={busy || it.qty <= 1}
                          disabledInc={busy || it.qty >= stock}
                        />
                        <div className="muted tiny">Stock: {stock}</div>
                      </td>
                      <td className="right">{formatCents(line)}</td>
                      <td className="right">
                        <Button
                          variant="secondary"
                          onClick={() => doAction(() => api.saveForLater(it.product_id, true))}
                          disabled={busy}
                        >
                          Save for later
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => doAction(() => api.removeItem(it.product_id))}
                          disabled={busy}
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          <div className="totals">
            <div className="totalsRow">
              <span className="muted">Subtotal (active items)</span>
              <span className="big">{formatCents(subtotal)}</span>
            </div>
            <div className="muted tiny">Items saved for later are not included in subtotal.</div>
          </div>
        </div>

        <div className="card">
          <h2>Saved for later</h2>
          {cart.savedForLater.length === 0 ? (
            <p className="muted">No items saved for later.</p>
          ) : (
            <div className="list">
              {cart.savedForLater.map((it) => (
                <div key={it.product_id} className="row">
                  <div className="rowMain">
                    <div className="title">{it.name}</div>
                    <div className="muted small">
                      Qty: {it.qty} • Unit: {formatCents(it.unit_price_cents)}
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => doAction(() => api.saveForLater(it.product_id, false))}
                    disabled={busy}
                  >
                    Move to cart
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => doAction(() => api.removeItem(it.product_id))}
                    disabled={busy}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <footer className="footer muted tiny">
        Tip: If you want real users, add login and create one cart per user.
      </footer>
    </div>
  );
}

import React, { useEffect, useMemo, useState } from "react";
import { api } from "./api";
import { formatUsdFromCents } from "./money";

function clampInt(n, fallback) {
  const x = Number(n);
  return Number.isInteger(x) ? x : fallback;
}

export default function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({ active: [], saved: [], grand_total_cents: 0 });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [addSku, setAddSku] = useState("");
  const [addQty, setAddQty] = useState(1);

  const productBySku = useMemo(() => {
    const m = new Map();
    for (const p of products) m.set(p.sku, p);
    return m;
  }, [products]);

  async function refreshAll() {
    setErr("");
    setLoading(true);
    try {
      const [{ products: p }, c] = await Promise.all([api.getProducts(), api.getCart()]);
      setProducts(p);
      setCart(c);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshAll();
  }, []);

  async function run(action) {
    setErr("");
    setLoading(true);
    try {
      const next = await action();
      setCart(next);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  const activeTotal = formatUsdFromCents(cart.grand_total_cents);

  return (
    <div className="container">
      <div className="header">
        <div>
          <h2 style={{ margin: 0 }}>Shopping Cart</h2>
          <div className="small">Exact totals computed in integer cents (no floating-point drift).</div>
        </div>
        <div className="card" style={{ padding: 12, minWidth: 220 }}>
          <div className="small">Grand Total (Active only)</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{activeTotal}</div>
          <div className="small">Saved items excluded</div>
        </div>
      </div>

      {err ? <div className="error" style={{ marginBottom: 14 }}>{err}</div> : null}

      <div className="grid">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Active Cart <span className="badge">{cart.active.length} items</span></h3>
          <CartTable
            items={cart.active}
            loading={loading}
            onDecrement={(id) => run(() => api.patchItem(id, { delta: -1 }))}
            onIncrement={(id) => run(() => api.patchItem(id, { delta: 1 }))}
            onSetQty={(id, q) => run(() => api.patchItem(id, { quantity: q }))}
            onSave={(id) => run(() => api.moveItem(id, "saved"))}
            onDelete={(id) => run(() => api.deleteItem(id))}
            actionLabel="Save for later"
          />
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Add Item</h3>

          <div className="notice" style={{ marginBottom: 12 }}>
            Stock validation is enforced on the server using:
            <div className="small" style={{ marginTop: 6 }}>
              <strong>(CurrentActiveCartQty + NewQty) ≤ Stock</strong>
            </div>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            <label>
              <div className="small">Product</div>
              <select
                value={addSku}
                onChange={(e) => setAddSku(e.target.value)}
                style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
                disabled={loading}
              >
                <option value="">Select a product…</option>
                {products.map((p) => (
                  <option key={p.sku} value={p.sku}>
                    {p.sku} — {p.name} ({formatUsdFromCents(p.price_cents)}) [stock: {p.stock}]
                  </option>
                ))}
              </select>
            </label>

            <label>
              <div className="small">Quantity</div>
              <input
                type="number"
                min="1"
                step="1"
                value={addQty}
                onChange={(e) => setAddQty(clampInt(e.target.value, 1))}
                disabled={loading}
                style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
              />
            </label>

            <div className="rowActions">
              <button
                className="btn btnPrimary"
                disabled={loading || !addSku}
                onClick={() =>
                  run(async () => {
                    const c = await api.addItem({ sku: addSku, qty: addQty, status: "active" });
                    return c;
                  })
                }
              >
                Add to cart
              </button>

              <button
                className="btn"
                disabled={loading || !addSku}
                onClick={() =>
                  run(async () => {
                    const c = await api.addItem({ sku: addSku, qty: addQty, status: "saved" });
                    return c;
                  })
                }
              >
                Save for later
              </button>

              <button className="btn" disabled={loading} onClick={refreshAll}>
                Refresh
              </button>
            </div>

            {addSku ? (
              <div className="small">
                Selected: <strong>{addSku}</strong>{" "}
                {productBySku.get(addSku) ? (
                  <>— {productBySku.get(addSku).name}</>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        <div className="card" style={{ gridColumn: "1 / -1" }}>
          <h3 style={{ marginTop: 0 }}>Saved for Later <span className="badge">{cart.saved.length} items</span></h3>
          <CartTable
            items={cart.saved}
            loading={loading}
            onDecrement={(id) => run(() => api.patchItem(id, { delta: -1 }))}
            onIncrement={(id) => run(() => api.patchItem(id, { delta: 1 }))}
            onSetQty={(id, q) => run(() => api.patchItem(id, { quantity: q }))}
            onSave={(id) => run(() => api.moveItem(id, "active"))}
            onDelete={(id) => run(() => api.deleteItem(id))}
            actionLabel="Move to cart"
          />
          <div className="small" style={{ marginTop: 10 }}>
            Note: moving back to cart will merge with existing active SKU and will enforce stock.
          </div>
        </div>
      </div>
    </div>
  );
}

function CartTable({
  items,
  loading,
  onDecrement,
  onIncrement,
  onSetQty,
  onSave,
  onDelete,
  actionLabel
}) {
  if (!items.length) {
    return <div className="small">No items.</div>;
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table className="table">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Name</th>
            <th>Price</th>
            <th style={{ width: 220 }}>Qty</th>
            <th>Line Total</th>
            <th style={{ width: 280 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <ItemRow
              key={it.id}
              it={it}
              loading={loading}
              onDecrement={onDecrement}
              onIncrement={onIncrement}
              onSetQty={onSetQty}
              onSave={onSave}
              onDelete={onDelete}
              actionLabel={actionLabel}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ItemRow({ it, loading, onDecrement, onIncrement, onSetQty, onSave, onDelete, actionLabel }) {
  const [draft, setDraft] = useState(it.quantity);

  useEffect(() => {
    setDraft(it.quantity);
  }, [it.quantity]);

  const price = formatUsdFromCents(it.product.price_cents);
  const line = formatUsdFromCents(it.line_total_cents);

  return (
    <tr>
      <td><strong>{it.product.sku}</strong></td>
      <td>{it.product.name}</td>
      <td>{price}</td>
      <td>
        <div className="qty">
          <button className="btn" disabled={loading} onClick={() => onDecrement(it.id)}>-</button>
          <input
            type="number"
            min="1"
            step="1"
            value={draft}
            disabled={loading}
            onChange={(e) => {
              const n = Number(e.target.value);
              setDraft(Number.isInteger(n) ? n : draft);
            }}
            onBlur={() => {
              if (draft !== it.quantity && Number.isInteger(draft) && draft > 0) {
                onSetQty(it.id, draft);
              } else {
                setDraft(it.quantity);
              }
            }}
          />
          <button className="btn" disabled={loading} onClick={() => onIncrement(it.id)}>+</button>
        </div>
        <div className="small">stock: {it.product.stock}</div>
      </td>
      <td><strong>{line}</strong></td>
      <td>
        <div className="rowActions">
          <button className="btn" disabled={loading} onClick={() => onSave(it.id)}>
            {actionLabel}
          </button>
          <button className="btn" disabled={loading} onClick={() => onDelete(it.id)}>
            Remove
          </button>
        </div>
      </td>
    </tr>
  );
}

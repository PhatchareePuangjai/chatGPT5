import React, { useEffect, useState } from "react";
import { apiGet, apiPost } from "../api.js";

function money(cents) {
  return (cents / 100).toLocaleString(undefined, { style: "currency", currency: "THB" });
}

export default function Shop() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function load() {
    setLoading(true);
    setErr("");
    setMsg("");
    try {
      const data = await apiGet("/api/products");
      setItems(data.items ?? []);
    } catch (e) {
      setErr(e.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function buy(productId) {
    setErr("");
    setMsg("");
    try {
      await apiPost("/api/purchase", { productId: Number(productId), quantity: 1 });
      setMsg("Purchase successful! Stock updated.");
      await load();
    } catch (e) {
      setErr(e.message || "Purchase failed");
    }
  }

  return (
    <section className="card">
      <div className="row">
        <h2>Shop</h2>
        <button className="btn" onClick={load} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {err ? <div className="alert error">{err}</div> : null}
      {msg ? <div className="alert ok">{msg}</div> : null}

      <div className="grid">
        {items.map((p) => (
          <div className="product" key={p.id}>
            <div className="productTop">
              <div>
                <div className="productName">{p.name}</div>
                <div className="muted">SKU: {p.sku}</div>
              </div>
              <div className={p.stock < 5 ? "stock low" : "stock"}>
                Stock: <strong>{p.stock}</strong>
              </div>
            </div>

            <div className="productBottom">
              <div className="price">{money(p.price_cents)}</div>
              <button
                className="btn primary"
                onClick={() => buy(p.id)}
                disabled={p.stock <= 0}
                title={p.stock <= 0 ? "Out of stock" : "Buy 1 item"}
              >
                Buy 1
              </button>
            </div>
          </div>
        ))}

        {!loading && items.length === 0 ? <div className="muted">No products found.</div> : null}
      </div>
    </section>
  );
}

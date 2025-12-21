import React, { useEffect, useState } from "react";
import { apiGet, apiPost } from "../api.js";

function formatDate(iso) {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "-" : d.toLocaleString();
}

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [low, setLow] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function load() {
    setLoading(true);
    setErr("");
    setMsg("");
    try {
      const [all, lowStock] = await Promise.all([
        apiGet("/api/products"),
        apiGet("/api/low-stock")
      ]);
      setItems(all.items ?? []);
      setLow(lowStock.items ?? []);
    } catch (e) {
      setErr(e.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function restock(productId) {
    setErr("");
    setMsg("");
    try {
      await apiPost("/api/restock", { productId, quantity: 5 });
      setMsg("Restocked +5. Inventory updated.");
      await load();
    } catch (e) {
      setErr(e.message || "Restock failed");
    }
  }

  return (
    <section className="card">
      <div className="row">
        <h2>Inventory Dashboard</h2>
        <button className="btn" onClick={load} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {err ? <div className="alert error">{err}</div> : null}
      {msg ? <div className="alert ok">{msg}</div> : null}

      <div className="twoCol">
        <div>
          <h3>All Stock</h3>
          <div className="tableWrap">
            <table className="table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Name</th>
                  <th className="right">Stock</th>
                  <th>Updated</th>
                  <th className="right">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.id}>
                    <td>{p.sku}</td>
                    <td>{p.name}</td>
                    <td className={p.stock < 5 ? "right lowText" : "right"}>
                      <strong>{p.stock}</strong>
                    </td>
                    <td className="muted">{formatDate(p.updated_at)}</td>
                    <td className="right">
                      <button className="btn" onClick={() => restock(p.id)}>
                        Restock +5
                      </button>
                    </td>
                  </tr>
                ))}
                {!loading && items.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="muted">No products found.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3>Low Stock (stock &lt; 5)</h3>
          {low.length === 0 && !loading ? (
            <div className="alert ok">No low-stock items 🎉</div>
          ) : (
            <div className="list">
              {low.map((p) => (
                <div className="listItem" key={p.id}>
                  <div>
                    <div className="productName">{p.name}</div>
                    <div className="muted">SKU: {p.sku}</div>
                  </div>
                  <div className="lowBadge">{p.stock}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

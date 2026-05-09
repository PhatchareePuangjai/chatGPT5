import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  InventoryLog,
  Product,
  createProduct,
  listAlerts,
  listLogs,
  listProducts,
  purchase,
  restore,
} from "./api";

function toInt(v: string, fallback: number) {
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
}

function clampInt(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

type Toast = { kind: "ok" | "err"; title: string; text: string };

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [logs, setLogs] = useState<InventoryLog[]>([]);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimer = useRef<number | null>(null);

  const [query, setQuery] = useState("");
  const [rightTab, setRightTab] = useState<"alerts" | "logs">("alerts");

  const [newSku, setNewSku] = useState("");
  const [newName, setNewName] = useState("");
  const [newQty, setNewQty] = useState("10");
  const [newThreshold, setNewThreshold] = useState("5");

  const [opSku, setOpSku] = useState("");
  const [opQty, setOpQty] = useState("1");

  const lowSkuSet = useMemo(() => {
    const s = new Set<string>();
    for (const p of products) {
      if (p.quantity <= p.low_stock_threshold) s.add(p.sku);
    }
    return s;
  }, [products]);

  const lowCount = useMemo(() => {
    let n = 0;
    for (const p of products) {
      if (p.quantity <= p.low_stock_threshold) n += 1;
    }
    return n;
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => {
      return p.sku.toLowerCase().includes(q) || p.name.toLowerCase().includes(q);
    });
  }, [products, query]);

  const selectedProduct = useMemo(() => {
    const sku = opSku.trim();
    if (!sku) return null;
    return products.find((p) => p.sku === sku) ?? null;
  }, [opSku, products]);

  function showToast(next: Toast) {
    setToast(next);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3500);
  }

  useEffect(() => {
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, []);

  async function refreshAll() {
    setLoading(true);
    const [ps, as, ls] = await Promise.all([listProducts(), listAlerts(), listLogs()]);
    setProducts(ps);
    setAlerts(as);
    setLogs(ls);
    setLoading(false);
    return { ps, as, ls };
  }

  useEffect(() => {
    refreshAll()
      .then(({ ps }) => setOpSku(ps[0]?.sku ?? ""))
      .catch((e: unknown) => {
        setLoading(false);
        showToast({
          kind: "err",
          title: "โหลดข้อมูลไม่สำเร็จ",
          text: e instanceof Error ? e.message : String(e),
        });
      });
  }, []);

  useEffect(() => {
    if (!opSku && products.length > 0) setOpSku(products[0]!.sku);
  }, [products, opSku]);

  async function run(label: string, fn: () => Promise<void>) {
    setBusy(true);
    setToast(null);
    try {
      await fn();
      showToast({ kind: "ok", title: "สำเร็จ", text: label });
    } catch (e: unknown) {
      showToast({
        kind: "err",
        title: "เกิดข้อผิดพลาด",
        text: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setBusy(false);
    }
  }

  const canCreate = newSku.trim().length > 0 && newName.trim().length > 0;

  return (
    <div className="container">
      <div className="topbar">
        <div className="brand">
          <h1>IMCS01 — Inventory</h1>
          <p>
            โทนสีเขียวอ่อน เน้นใช้งานง่าย: สร้างสินค้า, ตัดสต็อก, คืนสต็อก และดู Alerts/Logs
          </p>
        </div>
        <div className="actions">
          <div className="stats">
            <div className="stat">
              สินค้าทั้งหมด <strong>{products.length}</strong>
            </div>
            <div className="stat">
              ใกล้หมด <strong>{lowCount}</strong>
            </div>
            <div className="stat">
              Alerts <strong>{alerts.length}</strong>
            </div>
          </div>
          <button
            className="secondary"
            disabled={busy}
            onClick={() => run("รีเฟรชข้อมูล", async () => void (await refreshAll()))}
          >
            Refresh
          </button>
        </div>
      </div>

      {toast && (
        <div className={`toast ${toast.kind}`}>
          <div style={{ flex: 1 }}>
            <div className="title">{toast.title}</div>
            <div className="body">{toast.text}</div>
          </div>
          <button
            type="button"
            className="secondary"
            onClick={() => setToast(null)}
            style={{ padding: "6px 10px" }}
          >
            ปิด
          </button>
        </div>
      )}

      <div className="grid" style={{ marginTop: 14 }}>
        <div className="card">
          <h3 style={{ marginTop: 0, marginBottom: 6 }}>สินค้า (Products)</h3>

          <div className="toolbar">
            <div className="left">
              <input
                placeholder="ค้นหา SKU หรือชื่อสินค้า..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ minWidth: 260 }}
              />
              {loading ? <span className="muted">กำลังโหลด...</span> : null}
            </div>
            <div className="right">
              <span className="pill info">
                แสดง {filteredProducts.length}/{products.length}
              </span>
            </div>
          </div>

          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>ชื่อ</th>
                  <th>คงเหลือ</th>
                  <th>Threshold</th>
                  <th>สถานะ</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => {
                  const isLow = p.quantity <= p.low_stock_threshold;
                  return (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 800 }}>{p.sku}</td>
                      <td>{p.name}</td>
                      <td>{p.quantity}</td>
                      <td>{p.low_stock_threshold}</td>
                      <td>{isLow ? <span className="pill warn">LOW</span> : <span className="pill ok">OK</span>}</td>
                      <td>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              run("ตัดสต็อก 1 ชิ้น", async () => {
                                setOpSku(p.sku);
                                setOpQty("1");
                                await purchase({ sku: p.sku, quantity: 1 });
                                await refreshAll();
                              })
                            }
                            style={{ padding: "7px 10px" }}
                          >
                            ซื้อ 1
                          </button>
                          <button
                            type="button"
                            className="secondary"
                            disabled={busy}
                            onClick={() =>
                              run("คืนสต็อก 1 ชิ้น", async () => {
                                setOpSku(p.sku);
                                setOpQty("1");
                                await restore({ sku: p.sku, quantity: 1 });
                                await refreshAll();
                              })
                            }
                            style={{ padding: "7px 10px" }}
                          >
                            คืน 1
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {products.length === 0 && (
                  <tr>
                    <td colSpan={6} className="muted">
                      ยังไม่มีสินค้า — สร้างสินค้าได้ที่ฝั่งขวา
                    </td>
                  </tr>
                )}
                {products.length > 0 && filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="muted">
                      ไม่พบสินค้าที่ตรงกับคำค้นหา
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>ศูนย์ควบคุม (Control)</h3>

          <div className="tabs" style={{ marginBottom: 12 }}>
            <button
              type="button"
              className={`tab ${rightTab === "alerts" ? "active" : ""}`}
              onClick={() => setRightTab("alerts")}
            >
              Alerts ({alerts.length})
            </button>
            <button
              type="button"
              className={`tab ${rightTab === "logs" ? "active" : ""}`}
              onClick={() => setRightTab("logs")}
            >
              Logs ({logs.length})
            </button>
          </div>

          <div style={{ marginBottom: 16 }}>
            {rightTab === "alerts" ? (
              <>
                <div className="muted" style={{ fontSize: 13, marginBottom: 8 }}>
                  ระบบจะสร้าง alert เมื่อคงเหลือ ≤ threshold
                </div>
                <div className="tableWrap">
                  <table>
                    <thead>
                      <tr>
                        <th>เวลา</th>
                        <th>ชนิด</th>
                        <th>ข้อความ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {alerts.map((a) => (
                        <tr key={a.id}>
                          <td className="muted">{new Date(a.created_at).toLocaleString()}</td>
                          <td>
                            <span className="pill warn">{a.kind}</span>
                          </td>
                          <td title={a.message}>{a.message}</td>
                        </tr>
                      ))}
                      {alerts.length === 0 && (
                        <tr>
                          <td colSpan={3} className="muted">
                            ยังไม่มี alert
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <>
                <div className="muted" style={{ fontSize: 13, marginBottom: 8 }}>
                  แสดงรายการล่าสุด 20 รายการ
                </div>
                <div className="tableWrap">
                  <table>
                    <thead>
                      <tr>
                        <th>เวลา</th>
                        <th>ประเภท</th>
                        <th>Delta</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.slice(0, 20).map((l) => (
                        <tr key={l.id}>
                          <td className="muted">{new Date(l.created_at).toLocaleString()}</td>
                          <td>{l.type}</td>
                          <td style={{ fontWeight: 800 }}>{l.delta}</td>
                        </tr>
                      ))}
                      {logs.length === 0 && (
                        <tr>
                          <td colSpan={3} className="muted">
                            ยังไม่มี log
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>

          <hr style={{ margin: "16px 0", borderColor: "rgba(15,42,27,0.10)" }} />

          <h3 style={{ marginTop: 0, marginBottom: 6 }}>สร้างสินค้าใหม่</h3>
          <div className="muted" style={{ fontSize: 13, marginBottom: 10 }}>
            กรอก SKU และชื่อสินค้า แล้วกด Create
          </div>

          <div className="row">
            <div>
              <label>SKU</label>
              <input
                value={newSku}
                placeholder="SKU-001"
                onChange={(e) => setNewSku(e.target.value)}
              />
            </div>
            <div style={{ gridColumn: "span 3" }}>
              <label>Name</label>
              <input
                value={newName}
                placeholder="เช่น น้ำดื่ม 600ml"
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div>
              <label>Quantity</label>
              <input
                type="number"
                min={0}
                value={newQty}
                onChange={(e) => setNewQty(e.target.value)}
              />
            </div>
            <div>
              <label>Low-stock threshold</label>
              <input
                type="number"
                min={0}
                value={newThreshold}
                onChange={(e) => setNewThreshold(e.target.value)}
              />
            </div>
            <div style={{ gridColumn: "span 2", display: "flex", alignItems: "end", gap: 10 }}>
              <button
                type="button"
                disabled={busy || !canCreate}
                onClick={() =>
                  run("สร้างสินค้า", async () => {
                    const sku = newSku.trim();
                    const name = newName.trim();
                    await createProduct({
                      sku,
                      name,
                      quantity: clampInt(toInt(newQty, 0), 0, 1_000_000_000),
                      low_stock_threshold: clampInt(toInt(newThreshold, 5), 0, 1_000_000_000),
                    });
                    const { ps } = await refreshAll();
                    setOpSku(sku || ps[0]?.sku || "");
                    setNewSku("");
                    setNewName("");
                  })
                }
              >
                Create
              </button>
              <button
                type="button"
                className="secondary"
                disabled={busy}
                onClick={() => {
                  setNewSku("");
                  setNewName("");
                  setNewQty("10");
                  setNewThreshold("5");
                }}
              >
                Clear
              </button>
            </div>
          </div>

          <hr style={{ margin: "16px 0", borderColor: "rgba(15,42,27,0.10)" }} />

          <h3 style={{ marginTop: 0, marginBottom: 6 }}>ตัดสต็อก / คืนสต็อก</h3>
          <div className="row">
            <div style={{ gridColumn: "span 2" }}>
              <label>SKU</label>
              <select value={opSku} onChange={(e) => setOpSku(e.target.value)} disabled={busy}>
                <option value="" disabled>
                  เลือกสินค้า...
                </option>
                {products.map((p) => (
                  <option key={p.id} value={p.sku}>
                    {p.sku} — {p.name} (คงเหลือ {p.quantity})
                  </option>
                ))}
              </select>
              {selectedProduct && (
                <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span className="pill info">
                    คงเหลือ <strong>{selectedProduct.quantity}</strong>
                  </span>
                  <span className="pill info">
                    threshold <strong>{selectedProduct.low_stock_threshold}</strong>
                  </span>
                  {lowSkuSet.has(selectedProduct.sku) ? (
                    <span className="pill warn">ใกล้หมด</span>
                  ) : (
                    <span className="pill ok">ปกติ</span>
                  )}
                </div>
              )}
            </div>
            <div>
              <label>Qty</label>
              <input
                type="number"
                min={1}
                value={opQty}
                onChange={(e) => setOpQty(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "end" }}>
              <button
                type="button"
                disabled={busy || !opSku}
                onClick={() =>
                  run("ตัดสต็อก (Purchase)", async () => {
                    await purchase({
                      sku: opSku.trim(),
                      quantity: clampInt(toInt(opQty, 1), 1, 1_000_000_000),
                    });
                    await refreshAll();
                  })
                }
              >
                Purchase
              </button>
              <button
                type="button"
                className="secondary"
                disabled={busy || !opSku}
                onClick={() =>
                  run("คืนสต็อก (Restore)", async () => {
                    await restore({
                      sku: opSku.trim(),
                      quantity: clampInt(toInt(opQty, 1), 1, 1_000_000_000),
                    });
                    await refreshAll();
                  })
                }
              >
                Restore
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


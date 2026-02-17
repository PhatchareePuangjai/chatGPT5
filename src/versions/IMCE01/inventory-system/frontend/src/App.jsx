import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * Improved UX Dashboard (Tailwind)
 * - Auto-sync toggle
 * - Search + filter
 * - Disable actions while pending
 * - Stress test progress + summary
 * - Toasts
 * - Tx copy button
 * - Logs filter/search
 *
 * Preserves concurrency testing + consistency indicators.
 */

function nowIsoShort() {
  const d = new Date();
  return d.toISOString().replace("T", " ").slice(0, 19);
}

function makeTxId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `tx_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function cls(...xs) {
  return xs.filter(Boolean).join(" ");
}

function badgeForTxStatus(status) {
  if (status === "COMMITTED") return "bg-green-50 text-green-700 ring-1 ring-green-200";
  if (status === "PENDING") return "bg-blue-50 text-blue-700 ring-1 ring-blue-200";
  if (status === "REJECTED") return "bg-red-50 text-red-700 ring-1 ring-red-200";
  if (status === "ROLLED_BACK") return "bg-red-50 text-red-700 ring-1 ring-red-200";
  return "bg-slate-50 text-slate-700 ring-1 ring-slate-200";
}

function badgeForLogType(type) {
  if (type === "LOW_STOCK_ALERT") return "bg-red-50 text-red-700 ring-1 ring-red-200";
  if (type === "RESTOCK/RETURN") return "bg-green-50 text-green-700 ring-1 ring-green-200";
  if (type === "SALE") return "bg-blue-50 text-blue-700 ring-1 ring-blue-200";
  return "bg-slate-50 text-slate-700 ring-1 ring-slate-200";
}

function Button({ variant = "default", disabled, onClick, children, title, className }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold active:scale-[0.99] transition";
  const styles = {
    default: "bg-slate-900 text-white hover:bg-slate-800",
    outline: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50",
    blue: "bg-blue-600 text-white hover:bg-blue-700",
    green: "bg-green-600 text-white hover:bg-green-700",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={cls(
        base,
        styles[variant] || styles.default,
        disabled && "opacity-60 cursor-not-allowed active:scale-100",
        className
      )}
    >
      {children}
    </button>
  );
}

function Pill({ children, className }) {
  return (
    <span className={cls("rounded-full px-2 py-1 text-[11px] ring-1", className)}>{children}</span>
  );
}

function Spinner() {
  return (
    <span
      className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white"
      aria-hidden="true"
    />
  );
}

function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      {hint ? <div className="mt-1 text-xs text-slate-500">{hint}</div> : null}
    </div>
  );
}

export default function App() {
  const envBase = (import.meta?.env?.VITE_API_BASE ?? "").toString();
  const [apiBase, setApiBase] = useState(envBase);

  // Demo loads seed productId=1. Add more ids here if you seed more products later.
  const [productIds] = useState([1]);

  const [productsById, setProductsById] = useState({});
  const [recentLogsByProductId, setRecentLogsByProductId] = useState({});

  const [qty, setQty] = useState(1);
  const [stressQty, setStressQty] = useState(1);

  const [loading, setLoading] = useState(false);
  const [autoSync, setAutoSync] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL"); // ALL | LOW | OOS

  // Per product pending counts to improve usability (disable buttons, show spinner)
  const [pendingCountByProduct, setPendingCountByProduct] = useState({});

  // Transaction stream
  const [txList, setTxList] = useState([]);
  const txListRef = useRef(txList);
  useEffect(() => {
    txListRef.current = txList;
  }, [txList]);

  // Stress test state
  const [stressRun, setStressRun] = useState(null);
  // { runId, productId, total:5, done, committed, rejected, rolledback, startedAt }

  // Logs drawer
  const [logsOpen, setLogsOpen] = useState(false);
  const [logsProductId, setLogsProductId] = useState(1);
  const [logsType, setLogsType] = useState("ALL"); // ALL | SALE | RESTOCK/RETURN | LOW_STOCK_ALERT
  const [logsSearch, setLogsSearch] = useState("");

  // Toasts
  const [toasts, setToasts] = useState([]);
  function pushToast(kind, title, detail) {
    const id = makeTxId();
    setToasts((prev) => [{ id, kind, title, detail }, ...prev].slice(0, 5));
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }

  function api(path) {
    return `${apiBase}${path}`;
  }

  async function fetchProductAndLogs(id) {
    const resp = await fetch(api(`/api/products/${id}`));
    const data = await resp.json();
    if (!resp.ok) throw new Error(data?.error || `Failed to load product ${id}`);
    return data; // { product, recentLogs }
  }

  async function refreshAll(silent = false) {
    if (!silent) setLoading(true);
    try {
      const results = await Promise.allSettled(productIds.map((id) => fetchProductAndLogs(id)));
      const nextProducts = { ...productsById };
      const nextLogs = { ...recentLogsByProductId };

      for (let i = 0; i < results.length; i++) {
        const id = productIds[i];
        const r = results[i];
        if (r.status === "fulfilled") {
          nextProducts[id] = r.value.product;
          nextLogs[id] = r.value.recentLogs || [];
        }
      }
      setProductsById(nextProducts);
      setRecentLogsByProductId(nextLogs);
      setLastSyncAt(nowIsoShort());
    } catch (e) {
      if (!silent) pushToast("error", "Sync failed", e.message);
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => {
    refreshAll(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Optional auto-sync (poll). Off by default.
  useEffect(() => {
    if (!autoSync) return;
    const t = setInterval(() => refreshAll(true), 3000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSync]);

  const products = useMemo(() => {
    return productIds
      .map((id) => productsById[id])
      .filter(Boolean)
      .sort((a, b) => a.id - b.id);
  }, [productIds, productsById]);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      const s = (p.stock ?? 0);
      const matchesSearch =
        !q ||
        (p.name || "").toLowerCase().includes(q) ||
        (p.sku || "").toLowerCase().includes(q) ||
        String(p.id).includes(q);

      const matchesFilter =
        filter === "ALL" ||
        (filter === "LOW" && s <= 5) || // requirement: highlight threshold at stock ≤ 5
        (filter === "OOS" && s === 0);

      return matchesSearch && matchesFilter;
    });
  }, [products, search, filter]);

  const dashboard = useMemo(() => {
    const totalStock = products.reduce((sum, p) => sum + (p.stock ?? 0), 0);
    const outOfStock = products.filter((p) => (p.stock ?? 0) === 0).length;

    let recentAlerts = 0;
    for (const p of products) {
      const logs = recentLogsByProductId[p.id] || [];
      recentAlerts += logs.filter((l) => l.type === "LOW_STOCK_ALERT").length;
    }

    // Last 3 alert entries for quick glance
    const alerts = [];
    for (const p of products) {
      const logs = recentLogsByProductId[p.id] || [];
      for (const l of logs) if (l.type === "LOW_STOCK_ALERT") alerts.push({ ...l, productId: p.id });
    }
    alerts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return { totalStock, outOfStock, recentAlerts, lastAlerts: alerts.slice(0, 3) };
  }, [products, recentLogsByProductId]);

  function upsertTx(txId, patch) {
    setTxList((prev) => {
      const idx = prev.findIndex((t) => t.txId === txId);
      if (idx === -1) return [{ txId, ...patch }, ...prev];
      const copy = prev.slice();
      copy[idx] = { ...copy[idx], ...patch };
      return copy.sort((a, b) => (b.createdAtMs ?? 0) - (a.createdAtMs ?? 0));
    });
  }

  function bumpPending(productId, delta) {
    setPendingCountByProduct((prev) => {
      const cur = prev[productId] || 0;
      const next = Math.max(0, cur + delta);
      return { ...prev, [productId]: next };
    });
  }

  async function reconcile(productId) {
    const fresh = await fetchProductAndLogs(productId);
    setProductsById((prev) => ({ ...prev, [productId]: fresh.product }));
    setRecentLogsByProductId((prev) => ({ ...prev, [productId]: fresh.recentLogs || [] }));
    setLastSyncAt(nowIsoShort());
  }

  async function purchase(productId, quantity, mode = "single", stressRunId = null) {
    const txId = makeTxId();
    const createdAtMs = Date.now();

    bumpPending(productId, +1);

    upsertTx(txId, {
      txId,
      createdAt: nowIsoShort(),
      createdAtMs,
      productId,
      quantity,
      mode,
      status: "PENDING",
      httpStatus: null,
      message: "Sending request...",
      syncIndicator: "pending",
      remainingStock: null,
      lowStockAlertTriggered: null,
      stressRunId,
    });

    // Optimistic update (immediate UX)
    const p = productsById[productId];
    if (p && typeof p.stock === "number" && quantity > 0) {
      setProductsById((prev) => ({
        ...prev,
        [productId]: { ...prev[productId], stock: Math.max(0, prev[productId].stock - quantity) },
      }));
    }

    try {
      const resp = await fetch(api("/api/purchase"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity, txId }),
      });
      const data = await resp.json().catch(() => ({}));

      if (resp.ok && data.ok === true) {
        upsertTx(txId, {
          status: "COMMITTED",
          httpStatus: resp.status,
          message: "Committed (atomic stock + logs)",
          syncIndicator: "committed",
          remainingStock: data.remainingStock,
          lowStockAlertTriggered: !!data.lowStockAlertTriggered,
        });

        pushToast(
          "success",
          "Purchase committed",
          `Product #${productId} qty ${quantity} • remaining ${data.remainingStock}`
        );

        await reconcile(productId);
        return { ok: true, status: "COMMITTED" };
      }

      upsertTx(txId, {
        status: "REJECTED",
        httpStatus: resp.status,
        message: data?.error || "Rejected",
        syncIndicator: "rejected",
      });

      pushToast("error", "Purchase rejected", data?.error || `HTTP ${resp.status}`);
      await reconcile(productId);
      return { ok: false, status: "REJECTED" };
    } catch (e) {
      upsertTx(txId, {
        status: "ROLLED_BACK",
        httpStatus: 0,
        message: `Network error: ${e.message}`,
        syncIndicator: "rolled_back",
      });

      pushToast("error", "Network error", e.message);
      try {
        await reconcile(productId);
      } catch (_) {}
      return { ok: false, status: "ROLLED_BACK" };
    } finally {
      bumpPending(productId, -1);
    }
  }

  async function restore(productId, quantity) {
    const txId = makeTxId();
    const createdAtMs = Date.now();

    bumpPending(productId, +1);

    upsertTx(txId, {
      txId,
      createdAt: nowIsoShort(),
      createdAtMs,
      productId,
      quantity,
      mode: "restore",
      status: "PENDING",
      httpStatus: null,
      message: "Sending restoration...",
      syncIndicator: "pending",
    });

    // Optimistic update
    const p = productsById[productId];
    if (p && typeof p.stock === "number" && quantity > 0) {
      setProductsById((prev) => ({
        ...prev,
        [productId]: { ...prev[productId], stock: prev[productId].stock + quantity },
      }));
    }

    try {
      const resp = await fetch(api("/api/restore"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity, reason: "UI restore", txId }),
      });
      const data = await resp.json().catch(() => ({}));

      if (resp.ok && data.ok === true) {
        upsertTx(txId, {
          status: "COMMITTED",
          httpStatus: resp.status,
          message: "Restoration committed",
          syncIndicator: "committed",
        });

        pushToast("success", "Restored", `Product #${productId} +${quantity}`);
        await reconcile(productId);
        return;
      }

      upsertTx(txId, {
        status: "REJECTED",
        httpStatus: resp.status,
        message: data?.error || "Restore rejected",
        syncIndicator: "rejected",
      });

      pushToast("error", "Restore rejected", data?.error || `HTTP ${resp.status}`);
      await reconcile(productId);
    } catch (e) {
      upsertTx(txId, {
        status: "ROLLED_BACK",
        httpStatus: 0,
        message: `Network error: ${e.message}`,
        syncIndicator: "rolled_back",
      });

      pushToast("error", "Network error", e.message);
      try {
        await reconcile(productId);
      } catch (_) {}
    } finally {
      bumpPending(productId, -1);
    }
  }

  async function simulateStressTest(productId) {
    const runId = makeTxId();
    setStressRun({
      runId,
      productId,
      total: 5,
      done: 0,
      committed: 0,
      rejected: 0,
      rolledback: 0,
      startedAt: nowIsoShort(),
    });

    pushToast("info", "Stress test started", "Sending 5 concurrent purchase requests…");

    const calls = Array.from({ length: 5 }, async () => {
      const r = await purchase(productId, Number(stressQty), "stress", runId);
      setStressRun((prev) => {
        if (!prev || prev.runId !== runId) return prev;
        const done = prev.done + 1;
        return {
          ...prev,
          done,
          committed: prev.committed + (r?.status === "COMMITTED" ? 1 : 0),
          rejected: prev.rejected + (r?.status === "REJECTED" ? 1 : 0),
          rolledback: prev.rolledback + (r?.status === "ROLLED_BACK" ? 1 : 0),
        };
      });
    });

    await Promise.allSettled(calls);

    pushToast("info", "Stress test finished", "See summary and transaction stream.");
    try {
      await reconcile(productId);
    } catch (_) {}
  }

  const pendingFor = (productId) => (pendingCountByProduct[productId] || 0) > 0;

  const activeLogsRaw = useMemo(() => recentLogsByProductId[logsProductId] || [], [logsProductId, recentLogsByProductId]);
  const activeLogs = useMemo(() => {
    const q = logsSearch.trim().toLowerCase();
    return activeLogsRaw.filter((l) => {
      const matchType = logsType === "ALL" || l.type === logsType;
      const matchQ =
        !q ||
        (l.note || "").toLowerCase().includes(q) ||
        String(l.quantity || "").includes(q) ||
        String(l.id || "").includes(q);
      return matchType && matchQ;
    });
  }, [activeLogsRaw, logsType, logsSearch]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Toasts */}
      <div className="fixed right-4 top-4 z-50 flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cls(
              "rounded-2xl border bg-white p-3 shadow-lg",
              t.kind === "success" && "border-green-200",
              t.kind === "error" && "border-red-200",
              t.kind === "info" && "border-blue-200"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold">{t.title}</div>
                {t.detail ? <div className="mt-1 text-xs text-slate-600">{t.detail}</div> : null}
              </div>
              <button
                className="text-xs text-slate-400 hover:text-slate-600"
                onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between md:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-900 font-semibold text-white">
              IM
            </div>
            <div>
              <div className="text-sm font-semibold">Inventory Dashboard</div>
              <div className="text-xs text-slate-500">Atomic transactions • Concurrency-safe • Low stock ≤ 5</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 md:flex">
              <span className="text-xs text-slate-500">API Base</span>
              <input
                className="w-64 text-xs outline-none"
                placeholder="(blank uses Vite proxy)"
                value={apiBase}
                onChange={(e) => setApiBase(e.target.value)}
              />
            </div>

            <Button
              variant="outline"
              onClick={() => setAutoSync((v) => !v)}
              title="Auto sync every 3s"
              className={cls(autoSync && "border-blue-300 ring-1 ring-blue-200")}
            >
              <span className={cls("h-2 w-2 rounded-full", autoSync ? "bg-blue-600" : "bg-slate-300")} />
              Auto Sync
            </Button>

            <Button variant="outline" onClick={() => refreshAll()} disabled={loading}>
              {loading ? (
                <>
                  <span className="inline-flex h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
                  Syncing…
                </>
              ) : (
                "Sync Now"
              )}
            </Button>

            <div className="hidden items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-xs text-white sm:flex">
              <span className="opacity-80">Last Sync</span>
              <span className="font-semibold">{lastSyncAt || "—"}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        {/* Summary cards */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard label="Total Stock" value={dashboard.totalStock} hint="Sum across loaded products" />
          <StatCard label="Out of Stock Items" value={dashboard.outOfStock} hint="Stock = 0" />
          <StatCard label="Recent Alerts" value={dashboard.recentAlerts} hint="LOW_STOCK_ALERT entries (recent)" />
        </section>

        {/* Quick recent alerts */}
        <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">Recent Alerts</div>
              <div className="text-xs text-slate-500">Quick view of latest low-stock alerts</div>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setLogsType("LOW_STOCK_ALERT");
                setLogsOpen(true);
              }}
            >
              View All Alerts
            </Button>
          </div>

          <div className="mt-3 grid gap-2 md:grid-cols-3">
            {dashboard.lastAlerts.length === 0 ? (
              <div className="text-xs text-slate-500">No alerts yet.</div>
            ) : (
              dashboard.lastAlerts.map((a) => (
                <div key={a.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <Pill className={badgeForLogType("LOW_STOCK_ALERT")}>LOW_STOCK_ALERT</Pill>
                    <div className="text-[11px] text-slate-500">
                      {a.created_at ? new Date(a.created_at).toLocaleString() : "—"}
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-slate-700">
                    Product <span className="font-semibold">#{a.productId}</span>
                  </div>
                  {a.note ? <div className="mt-1 text-xs text-slate-600">{a.note}</div> : null}
                </div>
              ))
            )}
          </div>
        </section>

        {/* Products + side panel */}
        <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Product table */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              {/* Controls */}
              <div className="flex flex-col gap-3 border-b border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-sm font-semibold">Products</div>
                  <div className="text-xs text-slate-500">
                    Row highlights when <span className="font-semibold text-red-600">stock ≤ 5</span>.
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs">
                    Qty
                    <input
                      type="number"
                      min={1}
                      className="w-16 rounded-lg border border-slate-200 px-2 py-1 text-xs outline-none"
                      value={qty}
                      onChange={(e) => setQty(Number(e.target.value))}
                    />
                  </label>

                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs">
                    <span className="text-slate-500">Filter</span>
                    <select
                      className="rounded-lg border border-slate-200 px-2 py-1 text-xs outline-none"
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                    >
                      <option value="ALL">All</option>
                      <option value="LOW">Low Stock (≤ 5)</option>
                      <option value="OOS">Out of Stock</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs">
                    <span className="text-slate-500">Search</span>
                    <input
                      className="w-44 text-xs outline-none"
                      placeholder="name / sku / id"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>

                  <Button variant="outline" onClick={() => setTxList([])} title="Clear transaction stream">
                    Clear Tx
                  </Button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="sticky top-0 bg-slate-50 text-xs text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Product</th>
                      <th className="px-4 py-3">Stock</th>
                      <th className="px-4 py-3">Updated</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td className="px-4 py-6 text-sm text-slate-500" colSpan={4}>
                          No products match your filter.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => {
                        const stock = p.stock ?? 0;
                        const isLow = stock <= 5; // IMPORTANT: strict UX threshold per requirement
                        const rowTint = isLow ? "bg-red-50" : "bg-white";

                        const stockBadge = isLow
                          ? "bg-red-100 text-red-700 ring-1 ring-red-200"
                          : "bg-slate-100 text-slate-700 ring-1 ring-slate-200";

                        const isPending = pendingFor(p.id);

                        return (
                          <tr key={p.id} className={cls(rowTint, "transition-colors")}>
                            <td className="px-4 py-4">
                              <div className="font-medium">{p.name || `Product #${p.id}`}</div>
                              <div className="text-xs text-slate-500">ID: {p.id} • SKU: {p.sku || "—"}</div>
                            </td>

                            <td className="px-4 py-4">
                              <span className={cls("rounded-full px-2 py-1 text-xs", stockBadge)}>{stock}</span>
                              {isLow && <span className="ml-2 text-xs font-semibold text-red-600">≤ 5</span>}
                            </td>

                            <td className="px-4 py-4 text-xs text-slate-500">
                              {p.updated_at ? new Date(p.updated_at).toLocaleString() : "—"}
                            </td>

                            <td className="px-4 py-4">
                              <div className="flex flex-wrap justify-end gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setLogsProductId(p.id);
                                    setLogsType("ALL");
                                    setLogsSearch("");
                                    setLogsOpen(true);
                                  }}
                                >
                                  Logs
                                </Button>

                                <Button
                                  variant="green"
                                  disabled={isPending}
                                  onClick={() => restore(p.id, Number(qty))}
                                  title="RESTOCK/RETURN"
                                >
                                  {isPending ? <Spinner /> : null}
                                  Restore
                                </Button>

                                <Button
                                  variant="default"
                                  disabled={isPending}
                                  onClick={() => purchase(p.id, Number(qty), "single")}
                                  title="SALE"
                                >
                                  {isPending ? <Spinner /> : null}
                                  Buy
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Stress Test */}
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-sm font-semibold">Simulate Stress Test</div>
                  <div className="text-xs text-slate-500">
                    Fires <span className="font-semibold">5 concurrent</span> purchases (race condition test).
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs">
                    Qty
                    <input
                      type="number"
                      min={1}
                      className="w-16 rounded-lg border border-slate-200 px-2 py-1 text-xs outline-none"
                      value={stressQty}
                      onChange={(e) => setStressQty(Number(e.target.value))}
                    />
                  </label>

                  <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs">
                    Product
                    <select
                      className="rounded-lg border border-slate-200 px-2 py-1 text-xs outline-none"
                      value={logsProductId}
                      onChange={(e) => setLogsProductId(Number(e.target.value))}
                    >
                      {productIds.map((id) => (
                        <option key={id} value={id}>
                          #{id}
                        </option>
                      ))}
                    </select>
                  </label>

                  <Button variant="blue" onClick={() => simulateStressTest(Number(logsProductId))}>
                    Run 5x Concurrent
                  </Button>
                </div>
              </div>

              {/* Stress summary */}
              {stressRun ? (
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div className="text-xs text-slate-600">
                      Run: <span className="font-mono">{stressRun.runId.slice(0, 8)}</span> • Product{" "}
                      <span className="font-semibold">#{stressRun.productId}</span> • Started{" "}
                      <span className="font-semibold">{stressRun.startedAt}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Pill className="bg-white text-slate-700 ring-slate-200">Done: {stressRun.done}/5</Pill>
                      <Pill className="bg-green-50 text-green-700 ring-green-200">Committed: {stressRun.committed}</Pill>
                      <Pill className="bg-red-50 text-red-700 ring-red-200">Rejected: {stressRun.rejected}</Pill>
                      <Pill className="bg-red-50 text-red-700 ring-red-200">Rollback: {stressRun.rolledback}</Pill>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Tx stream */}
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-xs font-semibold text-slate-600">Transaction Stream</div>
                  <div className="text-[11px] text-slate-500">Shows Sync Status + Transaction ID</div>
                </div>

                <div className="max-h-80 overflow-auto rounded-xl border border-slate-200 bg-slate-50">
                  {txList.length === 0 ? (
                    <div className="p-4 text-xs text-slate-500">No transactions yet.</div>
                  ) : (
                    <ul className="divide-y divide-slate-200">
                      {txList.map((t) => (
                        <li key={t.txId} className="p-3">
                          <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                            <div className="flex flex-wrap items-center gap-2">
                              <Pill className={badgeForTxStatus(t.status)}>{t.status}</Pill>

                              <Pill className="bg-white text-slate-600 ring-slate-200">
                                Tx: <span className="font-mono">{t.txId.slice(0, 8)}</span>
                                <button
                                  className="ml-2 text-[11px] text-slate-400 hover:text-slate-700"
                                  title="Copy full Tx ID"
                                  onClick={() => {
                                    navigator.clipboard?.writeText?.(t.txId);
                                    pushToast("info", "Copied", "Transaction ID copied to clipboard");
                                  }}
                                >
                                  Copy
                                </button>
                              </Pill>

                              <span className="text-xs text-slate-600">
                                Product <span className="font-semibold">#{t.productId}</span> • Qty{" "}
                                <span className="font-semibold">{t.quantity}</span>
                              </span>

                              {typeof t.remainingStock === "number" ? (
                                <span className="text-xs text-slate-600">
                                  Remaining: <span className="font-semibold">{t.remainingStock}</span>
                                </span>
                              ) : null}

                              {t.lowStockAlertTriggered === true ? (
                                <Pill className="bg-red-100 text-red-700 ring-red-200">Low Stock Alert (≤ 5)</Pill>
                              ) : null}

                              {t.mode === "restore" ? (
                                <Pill className="bg-green-100 text-green-700 ring-green-200">Restoration</Pill>
                              ) : null}

                              {t.mode === "stress" ? (
                                <Pill className="bg-blue-50 text-blue-700 ring-blue-200">Stress</Pill>
                              ) : null}
                            </div>

                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <span>{t.createdAt}</span>
                              <Pill className="bg-white text-slate-600 ring-slate-200">HTTP {t.httpStatus ?? "—"}</Pill>
                            </div>
                          </div>

                          <div className="mt-1 text-xs text-slate-600">
                            <span className="font-semibold text-slate-700">Sync:</span>{" "}
                            <span className="font-mono">{t.syncIndicator}</span> • {t.message}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="mt-2 text-[11px] text-slate-500">
                  * “COMMITTED” = backend transaction completed (stock update + logs written atomically).
                </div>
              </div>
            </div>
          </div>

          {/* Right panel: logs preview */}
          <aside className="lg:col-span-1">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold">Inventory Logs</div>
                  <div className="text-xs text-slate-500">Scrollable, searchable, filterable</div>
                </div>
                <Button variant="outline" onClick={() => setLogsOpen(true)}>
                  Open
                </Button>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs">
                  <span className="text-slate-500">Product</span>
                  <select
                    className="rounded-lg border border-slate-200 px-2 py-1 text-xs outline-none"
                    value={logsProductId}
                    onChange={(e) => setLogsProductId(Number(e.target.value))}
                  >
                    {productIds.map((id) => (
                      <option key={id} value={id}>
                        #{id}
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  variant="outline"
                  onClick={() => {
                    setLogsType("ALL");
                    setLogsSearch("");
                    setLogsOpen(true);
                  }}
                >
                  Filter/Search
                </Button>
              </div>

              <div className="mt-4 max-h-96 overflow-auto rounded-xl border border-slate-200 bg-slate-50">
                {(recentLogsByProductId[logsProductId] || []).length === 0 ? (
                  <div className="p-4 text-xs text-slate-500">No logs loaded. Click Sync Now.</div>
                ) : (
                  <ul className="divide-y divide-slate-200">
                    {(recentLogsByProductId[logsProductId] || []).slice(0, 12).map((l) => (
                      <li key={l.id} className="p-3">
                        <div className="flex items-center justify-between gap-2">
                          <Pill className={badgeForLogType(l.type)}>{l.type}</Pill>
                          <span className="text-[11px] text-slate-500">
                            {l.created_at ? new Date(l.created_at).toLocaleString() : "—"}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-slate-700">
                          Qty: <span className="font-semibold">{l.quantity}</span>
                        </div>
                        {l.note ? <div className="mt-1 text-xs text-slate-600 line-clamp-2">{l.note}</div> : null}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="mt-3 text-[11px] text-slate-500">
                Color logic: <span className="font-semibold text-red-600">Red</span> stock ≤ 5 •{" "}
                <span className="font-semibold text-green-600">Green</span> restoration •{" "}
                <span className="font-semibold text-blue-600">Blue</span> SALE/info
              </div>
            </div>
          </aside>
        </section>
      </main>

      {/* Logs Drawer */}
      {logsOpen ? (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setLogsOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-4">
              <div>
                <div className="text-sm font-semibold">Inventory Logs</div>
                <div className="text-xs text-slate-500">Product #{logsProductId}</div>
              </div>
              <Button variant="outline" onClick={() => setLogsOpen(false)}>
                Close
              </Button>
            </div>

            <div className="p-4">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs">
                  <span className="text-slate-500">Type</span>
                  <select
                    className="rounded-lg border border-slate-200 px-2 py-1 text-xs outline-none"
                    value={logsType}
                    onChange={(e) => setLogsType(e.target.value)}
                  >
                    <option value="ALL">All</option>
                    <option value="SALE">SALE</option>
                    <option value="RESTOCK/RETURN">RESTOCK/RETURN</option>
                    <option value="LOW_STOCK_ALERT">LOW_STOCK_ALERT</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs">
                  <span className="text-slate-500">Search</span>
                  <input
                    className="w-44 text-xs outline-none"
                    placeholder="note / qty / id"
                    value={logsSearch}
                    onChange={(e) => setLogsSearch(e.target.value)}
                  />
                </div>

                <Button
                  variant="default"
                  onClick={async () => {
                    try {
                      await reconcile(logsProductId);
                      pushToast("success", "Logs refreshed", `Product #${logsProductId}`);
                    } catch (e) {
                      pushToast("error", "Refresh failed", e.message);
                    }
                  }}
                >
                  Refresh
                </Button>
              </div>

              <div className="mt-4 max-h-[calc(100vh-200px)] overflow-auto rounded-xl border border-slate-200 bg-slate-50">
                {activeLogs.length === 0 ? (
                  <div className="p-4 text-xs text-slate-500">No logs match filter/search.</div>
                ) : (
                  <ul className="divide-y divide-slate-200">
                    {activeLogs.map((l) => (
                      <li key={l.id} className="p-3">
                        <div className="flex items-center justify-between gap-2">
                          <Pill className={badgeForLogType(l.type)}>{l.type}</Pill>
                          <span className="text-[11px] text-slate-500">
                            {l.created_at ? new Date(l.created_at).toLocaleString() : "—"}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-slate-700">
                          Qty: <span className="font-semibold">{l.quantity}</span> • Log ID:{" "}
                          <span className="font-mono">{l.id}</span>
                        </div>
                        {l.note ? <div className="mt-1 text-xs text-slate-600">{l.note}</div> : null}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="mt-3 text-[11px] text-slate-500">
                Low stock alert rule is <span className="font-semibold">stock ≤ 5</span> (UI highlight + backend alert).
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
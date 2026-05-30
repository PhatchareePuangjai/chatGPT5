import React from "react";
import { apiRequest } from "../services/apiClient";
import { AlertsTable, type LowStockAlert } from "../components/tables/AlertsTable";

export function LowStockAlertsPage() {
  const [alerts, setAlerts] = React.useState<LowStockAlert[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function load() {
    setBusy(true);
    setError(null);
    try {
      const data = await apiRequest<{ alerts: LowStockAlert[] }>("/api/alerts/low-stock");
      setAlerts(data.alerts ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load alerts.");
    } finally {
      setBusy(false);
    }
  }

  React.useEffect(() => {
    void load();
  }, []);

  return (
    <section>
      <h2 style={{ margin: "0 0 8px 0" }}>Low Stock Alerts</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button
          type="button"
          onClick={() => void load()}
          disabled={busy}
          style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc" }}
        >
          {busy ? "Loading..." : "Refresh"}
        </button>
        {error ? (
          <div role="status" style={{ padding: "8px 10px", border: "1px solid #f2c2c2", background: "#fdeeee" }}>
            {error}
          </div>
        ) : null}
      </div>
      <AlertsTable alerts={alerts} />
    </section>
  );
}

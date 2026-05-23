import React from "react";
import { apiFetch, ApiError } from "../services/apiClient";

export function AlertsPage() {
  const [result, setResult] = React.useState<string>("");
  const [error, setError] = React.useState<string>("");

  async function onRefresh() {
    setError("");
    setResult("");
    try {
      const body = await apiFetch<{ alerts: unknown[] }>("/alerts?status=active");
      setResult(JSON.stringify(body, null, 2));
    } catch (e) {
      setError(formatApiError(e));
    }
  }

  return (
    <section style={{ display: "grid", gap: 12 }}>
      <h2 style={{ margin: 0, fontSize: 16 }}>Alerts</h2>
      <div>
        <button type="button" onClick={onRefresh}>
          Refresh
        </button>
      </div>
      {error ? (
        <pre style={{ background: "#fee2e2", padding: 12, borderRadius: 6, overflowX: "auto" }}>{error}</pre>
      ) : null}
      {result ? (
        <pre style={{ background: "#f3f4f6", padding: 12, borderRadius: 6, overflowX: "auto" }}>{result}</pre>
      ) : null}
    </section>
  );
}

function formatApiError(e: unknown): string {
  const err = e as Partial<ApiError>;
  return JSON.stringify({ code: err.code ?? "UNKNOWN", message: err.message ?? String(e), details: err.details }, null, 2);
}


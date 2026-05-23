import React from "react";
import { InputField } from "../components/forms/InputField";
import { apiFetch, ApiError } from "../services/apiClient";

export function OrderSimPage() {
  const [orderId, setOrderId] = React.useState("1");
  const [result, setResult] = React.useState<string>("");
  const [error, setError] = React.useState<string>("");

  async function run(action: "confirm" | "cancel") {
    setError("");
    setResult("");
    try {
      const body = await apiFetch(`/orders/${encodeURIComponent(orderId)}/${action}`, {
        method: "POST",
        body: JSON.stringify({ confirmedAt: new Date().toISOString(), canceledAt: new Date().toISOString() })
      });
      setResult(JSON.stringify(body, null, 2));
    } catch (e) {
      setError(formatApiError(e));
    }
  }

  return (
    <section style={{ display: "grid", gap: 12 }}>
      <h2 style={{ margin: 0, fontSize: 16 }}>Orders</h2>
      <div style={{ maxWidth: 240 }}>
        <InputField label="Order ID" value={orderId} onChange={setOrderId} />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" onClick={() => run("confirm")}>
          Confirm
        </button>
        <button type="button" onClick={() => run("cancel")}>
          Cancel
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


import React from "react";
import { InputField } from "../components/forms/InputField";
import { apiFetch, ApiError } from "../services/apiClient";

export function SkuPage() {
  const [skuCode, setSkuCode] = React.useState("SKU-001");
  const [onHandQty, setOnHandQty] = React.useState("10");
  const [threshold, setThreshold] = React.useState("5");
  const [result, setResult] = React.useState<string>("");
  const [error, setError] = React.useState<string>("");

  async function onSave() {
    setError("");
    setResult("");
    try {
      const body = await apiFetch<{ skuCode: string; onHandQty: number; lowStockThreshold: number }>(
        `/skus/${encodeURIComponent(skuCode)}`,
        {
          method: "PUT",
          body: JSON.stringify({ onHandQty: Number(onHandQty), lowStockThreshold: Number(threshold) })
        }
      );
      setResult(JSON.stringify(body, null, 2));
    } catch (e) {
      setError(formatApiError(e));
    }
  }

  async function onLoad() {
    setError("");
    setResult("");
    try {
      const body = await apiFetch<{ skuCode: string; onHandQty: number; lowStockThreshold: number }>(
        `/skus/${encodeURIComponent(skuCode)}`
      );
      setOnHandQty(String(body.onHandQty));
      setThreshold(String(body.lowStockThreshold));
      setResult(JSON.stringify(body, null, 2));
    } catch (e) {
      setError(formatApiError(e));
    }
  }

  return (
    <section style={{ display: "grid", gap: 12 }}>
      <h2 style={{ margin: 0, fontSize: 16 }}>SKU</h2>
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
        <InputField label="SKU code" value={skuCode} onChange={setSkuCode} />
        <InputField label="On hand qty" value={onHandQty} onChange={setOnHandQty} />
        <InputField label="Low-stock threshold" value={threshold} onChange={setThreshold} />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" onClick={onLoad}>
          Load
        </button>
        <button type="button" onClick={onSave}>
          Save
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


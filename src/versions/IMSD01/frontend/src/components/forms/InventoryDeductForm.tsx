import React from "react";
import { apiRequest, type ApiError } from "../../services/apiClient";

type Result =
  | { ok: true; message: string }
  | { ok: false; message: string };

export function InventoryDeductForm() {
  const [orderId, setOrderId] = React.useState("ORD-123");
  const [sku, setSku] = React.useState("SKU-001");
  const [quantity, setQuantity] = React.useState(2);
  const [result, setResult] = React.useState<Result | null>(null);
  const [busy, setBusy] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    setBusy(true);
    try {
      const data = await apiRequest<any>("/api/inventory/deduct", {
        method: "POST",
        body: JSON.stringify({ orderId, sku, quantity })
      });
      setResult({
        ok: true,
        message: `Deducted. ${data.sku}: ${data.previousOnHand} -> ${data.onHand}`
      });
    } catch (err: any) {
      const e2 = err as ApiError;
      setResult({ ok: false, message: e2.message ?? "Request failed." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} aria-label="Deduct stock form">
      <div style={{ display: "grid", gap: 10, maxWidth: 420 }}>
        <label>
          <div style={{ fontSize: 12, marginBottom: 4 }}>Order Id</div>
          <input
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            required
            style={{ width: "100%", padding: 8 }}
          />
        </label>

        <label>
          <div style={{ fontSize: 12, marginBottom: 4 }}>SKU</div>
          <input
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            required
            style={{ width: "100%", padding: 8 }}
          />
        </label>

        <label>
          <div style={{ fontSize: 12, marginBottom: 4 }}>Quantity</div>
          <input
            value={String(quantity)}
            onChange={(e) => setQuantity(Number(e.target.value))}
            required
            inputMode="numeric"
            pattern="[0-9]*"
            style={{ width: "100%", padding: 8 }}
          />
        </label>

        <button
          type="submit"
          disabled={busy}
          style={{ padding: "10px 12px", border: "1px solid #ccc", borderRadius: 6 }}
        >
          {busy ? "Submitting..." : "Deduct"}
        </button>

        {result ? (
          <div
            role="status"
            style={{
              padding: 10,
              borderRadius: 6,
              border: "1px solid #ddd",
              background: result.ok ? "#eef8ee" : "#fdeeee"
            }}
          >
            {result.message}
          </div>
        ) : null}
      </div>
    </form>
  );
}


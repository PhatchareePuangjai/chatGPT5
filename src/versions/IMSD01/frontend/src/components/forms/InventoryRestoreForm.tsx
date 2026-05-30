import React from "react";
import { apiRequest, type ApiError } from "../../services/apiClient";

type Result =
  | { ok: true; message: string }
  | { ok: false; message: string };

export function InventoryRestoreForm() {
  const [orderId, setOrderId] = React.useState("ORD-456");
  const [sku, setSku] = React.useState("SKU-003");
  const [quantity, setQuantity] = React.useState(1);
  const [reason, setReason] = React.useState<"CANCELED" | "EXPIRED">("CANCELED");
  const [result, setResult] = React.useState<Result | null>(null);
  const [busy, setBusy] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    setBusy(true);
    try {
      const data = await apiRequest<any>("/api/inventory/restore", {
        method: "POST",
        body: JSON.stringify({ orderId, sku, quantity, reason })
      });
      setResult({
        ok: true,
        message: `Restored. ${data.sku}: ${data.previousOnHand} -> ${data.onHand}`
      });
    } catch (err: any) {
      const e2 = err as ApiError;
      setResult({ ok: false, message: e2.message ?? "Request failed." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} aria-label="Restore stock form">
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

        <label>
          <div style={{ fontSize: 12, marginBottom: 4 }}>Reason</div>
          <select value={reason} onChange={(e) => setReason(e.target.value as any)} style={{ padding: 8 }}>
            <option value="CANCELED">Canceled</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </label>

        <button
          type="submit"
          disabled={busy}
          style={{ padding: "10px 12px", border: "1px solid #ccc", borderRadius: 6 }}
        >
          {busy ? "Submitting..." : "Restore"}
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


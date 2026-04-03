import { useState } from "react";
import { purchase } from "../services/api";

export function PurchasePage() {
  const [form, setForm] = useState({
    order_id: "",
    product_id: "",
    sku: "",
    quantity: 1,
  });
  const [result, setResult] = useState<string>("");
  const [alertNote, setAlertNote] = useState<string>("");

  const onChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult("Submitting...");
    const res = await purchase({
      order_id: form.order_id,
      product_id: form.product_id,
      sku: form.sku,
      quantity: Number(form.quantity),
    });
    const alertId = (res.body?.data as { alert_id?: string } | null)?.alert_id;
    setAlertNote(alertId ? `Low stock alert generated: ${alertId}` : "");
    setResult(JSON.stringify(res.body, null, 2));
  };

  return (
    <section className="card">
      <h2>Purchase</h2>
      <form onSubmit={onSubmit} className="form">
        <label>
          Order ID
          <input value={form.order_id} onChange={(e) => onChange("order_id", e.target.value)} />
        </label>
        <label>
          Product ID
          <input value={form.product_id} onChange={(e) => onChange("product_id", e.target.value)} />
        </label>
        <label>
          SKU
          <input value={form.sku} onChange={(e) => onChange("sku", e.target.value)} />
        </label>
        <label>
          Quantity
          <input
            type="number"
            min={1}
            value={form.quantity}
            onChange={(e) => onChange("quantity", e.target.value)}
          />
        </label>
        <button type="submit">Submit Purchase</button>
      </form>
      {alertNote ? <p><strong>{alertNote}</strong></p> : null}
      <pre className="result">{result}</pre>
    </section>
  );
}

import { useState } from "react";
import { cancel } from "../services/api";

export function CancelPage() {
  const [form, setForm] = useState({
    order_id: "",
    product_id: "",
    sku: "",
    quantity: 1,
    reason: "cancelled",
  });
  const [result, setResult] = useState<string>("");

  const onChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult("Submitting...");
    const res = await cancel({
      order_id: form.order_id,
      product_id: form.product_id,
      sku: form.sku,
      quantity: Number(form.quantity),
      reason: form.reason as "cancelled" | "expired",
    });
    setResult(JSON.stringify(res.body, null, 2));
  };

  return (
    <section className="card">
      <h2>Cancel / Expire</h2>
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
        <label>
          Reason
          <select value={form.reason} onChange={(e) => onChange("reason", e.target.value)}>
            <option value="cancelled">cancelled</option>
            <option value="expired">expired</option>
          </select>
        </label>
        <button type="submit">Submit Cancel</button>
      </form>
      <pre className="result">{result}</pre>
    </section>
  );
}

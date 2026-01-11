import React, { useEffect, useMemo, useState } from "react";
import { applyCoupon, createOrder } from "../api.js";

// money helpers for UI only (keep consistent with backend satang model)
function satangToTHB(satang) {
  const whole = Math.floor(Math.abs(satang) / 100);
  const frac = String(Math.abs(satang) % 100).padStart(2, "0");
  return (satang < 0 ? "-" : "") + `${whole}.${frac}`;
}
function thbToSatang(thbStr) {
  const s = String(thbStr).trim();
  if (!/^\d+(\.\d{0,2})?$/.test(s)) return null;
  const [whole, frac = ""] = s.split(".");
  const frac2 = (frac + "00").slice(0, 2);
  return parseInt(whole, 10) * 100 + parseInt(frac2, 10);
}

const DEMO_USER_ID = "11111111-1111-1111-1111-111111111111";

export default function Checkout() {
  // simple 1-item cart to prove edge cases (50 THB item + SAVE100 => 0)
  const [itemPriceTHB, setItemPriceTHB] = useState("50.00");
  const [qty, setQty] = useState(1);

  const [orderId, setOrderId] = useState("22222222-2222-2222-2222-222222222222"); // seeded 50 THB order
  const [couponCode, setCouponCode] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [breakdown, setBreakdown] = useState({
    original_total_satang: 5000,
    discount_percent_satang: 0,
    discount_fixed_satang: 0,
    grand_total_satang: 5000,
  });

  const originalTotalSatang = useMemo(() => {
    const price = thbToSatang(itemPriceTHB);
    if (price == null) return 0;
    return Math.max(0, price) * Math.max(1, qty);
  }, [itemPriceTHB, qty]);

  // Keep UI totals "real-time" (client-side), but the coupon calculation is authoritative on backend.
  useEffect(() => {
    setBreakdown((b) => ({
      ...b,
      original_total_satang: originalTotalSatang,
      // reset discounts when cart changes
      discount_percent_satang: 0,
      discount_fixed_satang: 0,
      grand_total_satang: originalTotalSatang,
    }));
    setCouponCode("");
    setError("");
    setStatus("idle");
  }, [originalTotalSatang]);

  async function handleCreateOrder() {
    setStatus("loading");
    setError("");
    try {
      const order = await createOrder({ userId: DEMO_USER_ID, original_total_satang: originalTotalSatang });
      setOrderId(order.id);
      setBreakdown({
        original_total_satang: order.original_total_satang,
        discount_percent_satang: 0,
        discount_fixed_satang: 0,
        grand_total_satang: order.grand_total_satang,
      });
      setStatus("idle");
    } catch (e) {
      setStatus("idle");
      setError(e.message || "Failed to create order");
    }
  }

  async function handleApplyCoupon() {
    setStatus("loading");
    setError("");
    try {
      const r = await applyCoupon({ userId: DEMO_USER_ID, orderId, couponCode });
      setBreakdown({
        original_total_satang: r.original_total_satang,
        discount_percent_satang: r.discount_percent_satang,
        discount_fixed_satang: r.discount_fixed_satang,
        grand_total_satang: r.grand_total_satang,
      });
      setStatus("idle");
    } catch (e) {
      setStatus("idle");
      // show clear error messaging for expired/overused/etc.
      const code = e.code || "ERROR";
      setError(`${code}: ${e.message}`);
    }
  }

  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>Cart</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, alignItems: "end" }}>
        <label>
          Item price (THB)
          <input
            value={itemPriceTHB}
            onChange={(e) => setItemPriceTHB(e.target.value)}
            style={{ width: "100%", padding: 8, marginTop: 6 }}
            placeholder="50.00"
          />
        </label>

        <label>
          Quantity
          <input
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(parseInt(e.target.value || "1", 10))}
            style={{ width: "100%", padding: 8, marginTop: 6 }}
          />
        </label>
      </div>

      <div style={{ marginTop: 12, fontSize: 14, color: "#333" }}>
        <div>Original total: <b>{satangToTHB(breakdown.original_total_satang)} THB</b></div>
        <div>Percent discount: <b>-{satangToTHB(breakdown.discount_percent_satang)} THB</b></div>
        <div>Fixed discount: <b>-{satangToTHB(breakdown.discount_fixed_satang)} THB</b></div>
        <div style={{ marginTop: 8, fontSize: 18 }}>
          Grand total: <b>{satangToTHB(breakdown.grand_total_satang)} THB</b>
        </div>
      </div>

      <hr style={{ margin: "16px 0" }} />

      <h2 style={{ margin: 0 }}>Coupon</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, marginTop: 10 }}>
        <input
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          placeholder="Enter coupon code"
          style={{ padding: 10 }}
        />
        <button
          onClick={handleApplyCoupon}
          disabled={status === "loading" || !couponCode.trim()}
          style={{ padding: "10px 14px" }}
        >
          {status === "loading" ? "Applying..." : "Apply"}
        </button>
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 10, alignItems: "center" }}>
        <button onClick={handleCreateOrder} disabled={status === "loading"} style={{ padding: "8px 12px" }}>
          Create new order (uses current cart)
        </button>
        <span style={{ fontSize: 12, color: "#666" }}>Order ID: <code>{orderId}</code></span>
      </div>

      {error ? (
        <div style={{ marginTop: 12, padding: 10, background: "#fff3f3", border: "1px solid #ffd0d0", borderRadius: 10 }}>
          <b style={{ color: "#b00020" }}>Error:</b> <span>{error}</span>
          <div style={{ marginTop: 6, fontSize: 12, color: "#666" }}>
            Try: <code>EXPIRED50</code> (expired), <code>MIN500100</code> (min 500 THB), <code>SAVE100</code> (one-time/user), <code>SAVE10P</code> (10%).
          </div>
        </div>
      ) : null}

      <div style={{ marginTop: 14, fontSize: 12, color: "#666" }}>
        <p style={{ margin: 0 }}>
          Note: calculations are performed in integer satang on the backend to prevent floating-point errors and enforce the order:
          <code> (Original - Percent) - Fixed</code>, then clamp to 0.
        </p>
      </div>
    </div>
  );
}

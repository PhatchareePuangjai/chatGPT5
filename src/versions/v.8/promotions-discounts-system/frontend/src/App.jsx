import React from "react";
import Checkout from "./components/Checkout.jsx";

export default function App() {
  return (
    <div style={{ fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial", padding: 24, maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 8 }}>Checkout</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        Demo coupons: <b>SAVE100</b>, <b>SAVE10P</b>, <b>MIN500100</b>, <b>EXPIRED50</b>
      </p>
      <Checkout />
    </div>
  );
}

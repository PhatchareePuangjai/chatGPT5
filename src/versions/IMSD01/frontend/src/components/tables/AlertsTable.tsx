import React from "react";

export type LowStockAlert = {
  sku: string;
  threshold: number;
  observedOnHand: number;
  createdAt: string;
};

export function AlertsTable(props: { alerts: LowStockAlert[] }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>SKU</th>
          <th style={{ textAlign: "right", borderBottom: "1px solid #ddd", padding: 8 }}>Threshold</th>
          <th style={{ textAlign: "right", borderBottom: "1px solid #ddd", padding: 8 }}>On Hand</th>
          <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Created</th>
        </tr>
      </thead>
      <tbody>
        {props.alerts.map((a) => (
          <tr key={`${a.sku}-${a.createdAt}`}>
            <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8 }}>{a.sku}</td>
            <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8, textAlign: "right" }}>
              {a.threshold}
            </td>
            <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8, textAlign: "right" }}>
              {a.observedOnHand}
            </td>
            <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8 }}>
              {new Date(a.createdAt).toLocaleString()}
            </td>
          </tr>
        ))}
        {props.alerts.length === 0 ? (
          <tr>
            <td colSpan={4} style={{ padding: 8, color: "#666" }}>
              No alerts.
            </td>
          </tr>
        ) : null}
      </tbody>
    </table>
  );
}


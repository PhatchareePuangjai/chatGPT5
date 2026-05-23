import React from "react";

export type AppRoute = "sku" | "alerts" | "orders";

export function AppShell(props: {
  route: AppRoute;
  onRouteChange: (r: AppRoute) => void;
  children: React.ReactNode;
}) {
  const { route, onRouteChange, children } = props;

  return (
    <div style={{ minHeight: "100vh", fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
      <header style={{ borderBottom: "1px solid #e5e7eb", padding: 12 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ fontWeight: 700 }}>IMSD02</div>
          <nav style={{ display: "flex", gap: 8 }}>
            <NavButton active={route === "sku"} onClick={() => onRouteChange("sku")}>
              SKU
            </NavButton>
            <NavButton active={route === "alerts"} onClick={() => onRouteChange("alerts")}>
              Alerts
            </NavButton>
            <NavButton active={route === "orders"} onClick={() => onRouteChange("orders")}>
              Orders
            </NavButton>
          </nav>
        </div>
      </header>
      <main style={{ padding: 16, maxWidth: 960, margin: "0 auto" }}>{children}</main>
    </div>
  );
}

function NavButton(props: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  const { active, onClick, children } = props;
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        borderRadius: 6,
        border: "1px solid " + (active ? "#111827" : "#d1d5db"),
        background: active ? "#111827" : "#fff",
        color: active ? "#fff" : "#111827",
        padding: "6px 10px",
        cursor: "pointer"
      }}
    >
      {children}
    </button>
  );
}


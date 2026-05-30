import React from "react";
import { routes, type RouteId } from "./routes";

export function App() {
  const [route, setRoute] = React.useState<RouteId>("deduct");
  const current = routes[route];

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: 16 }}>
      <h1 style={{ margin: "0 0 12px 0" }}>Inventory Admin</h1>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {Object.entries(routes).map(([id, r]) => (
          <button
            key={id}
            type="button"
            onClick={() => setRoute(id as RouteId)}
            style={{
              padding: "8px 10px",
              borderRadius: 6,
              border: "1px solid #ccc",
              background: route === id ? "#eee" : "white"
            }}
          >
            {r.title}
          </button>
        ))}
      </div>
      <div>{current.element}</div>
    </div>
  );
}


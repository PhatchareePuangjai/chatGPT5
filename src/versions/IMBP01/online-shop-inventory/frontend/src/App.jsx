import React, { useState } from "react";
import Shop from "./pages/Shop.jsx";
import Dashboard from "./pages/Dashboard.jsx";

export default function App() {
  const [page, setPage] = useState("shop");

  return (
    <div className="container">
      <header className="header">
        <div>
          <h1 className="title">Online Shop + Inventory</h1>
          <p className="subtitle">Buy items (subtract stock) + restock in dashboard</p>
        </div>

        <nav className="nav">
          <button className={page === "shop" ? "btn active" : "btn"} onClick={() => setPage("shop")}>
            Shop
          </button>
          <button className={page === "dashboard" ? "btn active" : "btn"} onClick={() => setPage("dashboard")}>
            Dashboard
          </button>
        </nav>
      </header>

      {page === "shop" ? <Shop /> : <Dashboard />}
    </div>
  );
}

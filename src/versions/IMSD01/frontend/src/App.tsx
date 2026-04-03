import { useState } from "react";
import { PurchasePage } from "./pages/Purchase";
import { CancelPage } from "./pages/Cancel";
import "./app.css";

export default function App() {
  const [tab, setTab] = useState<"purchase" | "cancel">("purchase");

  return (
    <div className="app">
      <header>
        <div>
          <h1>Inventory Manager</h1>
          <p>Minimal UI for purchase and cancel flows.</p>
        </div>
        <nav>
          <button
            className={`tab ${tab === "purchase" ? "active" : ""}`}
            onClick={() => setTab("purchase")}
          >
            Purchase
          </button>
          <button
            className={`tab ${tab === "cancel" ? "active" : ""}`}
            onClick={() => setTab("cancel")}
          >
            Cancel
          </button>
        </nav>
      </header>

      {tab === "purchase" ? <PurchasePage /> : <CancelPage />}
    </div>
  );
}

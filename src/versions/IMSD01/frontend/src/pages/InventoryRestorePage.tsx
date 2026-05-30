import React from "react";
import { InventoryRestoreForm } from "../components/forms/InventoryRestoreForm";

export function InventoryRestorePage() {
  return (
    <section>
      <h2 style={{ margin: "0 0 8px 0" }}>Restore Stock</h2>
      <InventoryRestoreForm />
    </section>
  );
}

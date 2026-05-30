import React from "react";
import { InventoryDeductForm } from "../components/forms/InventoryDeductForm";

export function InventoryDeductPage() {
  return (
    <section>
      <h2 style={{ margin: "0 0 8px 0" }}>Deduct Stock</h2>
      <InventoryDeductForm />
    </section>
  );
}

import React from "react";
import { InventoryDeductPage } from "./InventoryDeductPage";
import { InventoryRestorePage } from "./InventoryRestorePage";
import { LowStockAlertsPage } from "./LowStockAlertsPage";

export type RouteId = "deduct" | "restore" | "alerts";

export const routes: Record<RouteId, { title: string; element: React.ReactNode }> = {
  deduct: { title: "Deduct Stock", element: <InventoryDeductPage /> },
  restore: { title: "Restore Stock", element: <InventoryRestorePage /> },
  alerts: { title: "Low Stock Alerts", element: <LowStockAlertsPage /> }
};


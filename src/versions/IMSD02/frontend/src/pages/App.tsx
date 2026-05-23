import React from "react";
import { AppShell, type AppRoute } from "../components/AppShell";
import { AlertsPage } from "./AlertsPage";
import { OrderSimPage } from "./OrderSimPage";
import { SkuPage } from "./SkuPage";

export function App() {
  const [route, setRoute] = React.useState<AppRoute>("sku");

  let content: React.ReactNode = null;
  if (route === "sku") content = <SkuPage />;
  if (route === "alerts") content = <AlertsPage />;
  if (route === "orders") content = <OrderSimPage />;

  return (
    <AppShell route={route} onRouteChange={setRoute}>
      {content}
    </AppShell>
  );
}

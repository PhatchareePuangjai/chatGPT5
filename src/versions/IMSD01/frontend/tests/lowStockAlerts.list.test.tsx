import { describe, expect, it, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { LowStockAlertsPage } from "../src/pages/LowStockAlertsPage";

describe("LowStockAlertsPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders alerts from API", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => {
      return new Response(
        JSON.stringify({
          data: {
            alerts: [{ sku: "SKU-002", threshold: 5, observedOnHand: 4, createdAt: "2026-05-30T00:00:00Z" }]
          }
        }),
        { status: 200 }
      );
    }) as any);

    render(<LowStockAlertsPage />);
    expect(await screen.findByText("SKU-002")).toBeInTheDocument();
  });
});


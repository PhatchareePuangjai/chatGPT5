import { describe, expect, it, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InventoryDeductForm } from "../src/components/forms/InventoryDeductForm";

describe("InventoryDeductForm", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("shows success message on successful deduct", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn(async () => {
      return new Response(
        JSON.stringify({
          data: { sku: "SKU-001", previousOnHand: 10, onHand: 8, inventoryLog: { type: "SALE", delta: -2 } }
        }),
        { status: 200 }
      );
    }) as any);

    render(<InventoryDeductForm />);

    await user.click(screen.getByRole("button", { name: "Deduct" }));
    expect(await screen.findByRole("status")).toHaveTextContent("SKU-001: 10 -> 8");
  });

  it("shows error message on API error", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn(async () => {
      return new Response(JSON.stringify({ error: { code: "INSUFFICIENT_STOCK", message: "Insufficient stock." } }), {
        status: 409
      });
    }) as any);

    render(<InventoryDeductForm />);

    await user.click(screen.getByRole("button", { name: "Deduct" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Insufficient stock.");
  });
});


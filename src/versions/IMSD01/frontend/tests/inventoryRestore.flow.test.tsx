import { describe, expect, it, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InventoryRestoreForm } from "../src/components/forms/InventoryRestoreForm";

describe("InventoryRestoreForm", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("shows success message on successful restore", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn(async () => {
      return new Response(
        JSON.stringify({
          data: { sku: "SKU-003", previousOnHand: 5, onHand: 6, inventoryLog: { type: "RESTOCK/RETURN", delta: 1 } }
        }),
        { status: 200 }
      );
    }) as any);

    render(<InventoryRestoreForm />);

    await user.click(screen.getByRole("button", { name: "Restore" }));
    expect(await screen.findByRole("status")).toHaveTextContent("SKU-003: 5 -> 6");
  });
});


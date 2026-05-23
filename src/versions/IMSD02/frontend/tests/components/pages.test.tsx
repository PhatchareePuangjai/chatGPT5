import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { App } from "../../src/pages/App";

describe("pages render", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, json: async () => ({ alerts: [] }) })) as any);
  });

  it("renders the app shell", () => {
    render(<App />);
    expect(screen.getByText("IMSD02")).toBeTruthy();
    expect(screen.getByText("SKU")).toBeTruthy();
    expect(screen.getByText("Alerts")).toBeTruthy();
    expect(screen.getByText("Orders")).toBeTruthy();
  });
});


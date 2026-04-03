import { render } from "@testing-library/react";
import DiscountLines from "../../src/components/Checkout/DiscountLines";

describe("DiscountLines", () => {
  it("renders discount line items", () => {
    const { getByText } = render(
      <DiscountLines
        items={[{ type: "promotion", sourceId: "PROMO10", amount: 200 }]}
      />
    );
    expect(getByText("PROMO10")).toBeTruthy();
    expect(getByText("-200")).toBeTruthy();
  });
});

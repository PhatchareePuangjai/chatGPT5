import { fireEvent, render } from "@testing-library/react";
import CouponApply from "../../src/components/Checkout/CouponApply";

describe("CouponApply errors", () => {
  it("shows error message for invalid coupon", async () => {
    const { findByText, getByLabelText, getByText } = render(<CouponApply />);
    fireEvent.change(getByLabelText("Coupon Code"), {
      target: { value: "INVALID" },
    });
    fireEvent.click(getByText("Apply Coupon"));
    expect(await findByText("Minimum spend not met")).toBeTruthy();
  });
});

import { render } from "@testing-library/react";
import CouponApply from "../../src/components/Checkout/CouponApply";

describe("CouponApply", () => {
  it("renders apply button", () => {
    const { getByText } = render(<CouponApply />);
    expect(getByText("Apply Coupon")).toBeTruthy();
  });
});

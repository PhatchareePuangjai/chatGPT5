import React, { useState } from "react";
import axios from "axios";

const Checkout = ({ cartTotal }) => {
  const [promoCode, setPromoCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [newTotal, setNewTotal] = useState(cartTotal);
  const [message, setMessage] = useState("");

  const applyPromo = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/promotions/apply-coupon",
        {
          code: promoCode,
          cartTotal: cartTotal
        }
      );

      setDiscountAmount(response.data.discountAmount);
      setNewTotal(response.data.newTotal);
      setMessage(response.data.message);

    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to apply promo code"
      );
      setDiscountAmount(0);
      setNewTotal(cartTotal);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Checkout</h2>
      <p>Original Total: ${cartTotal.toFixed(2)}</p>
      <p>Discount: -${discountAmount.toFixed(2)}</p>
      <p>Final Total: ${newTotal.toFixed(2)}</p>

      <input
        type="text"
        placeholder="Enter Promo Code"
        value={promoCode}
        onChange={(e) => setPromoCode(e.target.value)}
      />
      <button onClick={applyPromo}>Apply</button>

      {message && <p>{message}</p>}
    </div>
  );
};

export default Checkout;

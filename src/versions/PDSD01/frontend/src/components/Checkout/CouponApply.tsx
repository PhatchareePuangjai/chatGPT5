import { useState } from "react";

import { evaluatePromotions } from "../../services/promotions";

export default function CouponApply() {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [total, setTotal] = useState<number | null>(null);

  const onApply = async () => {
    const result = await evaluatePromotions(code.trim());
    setMessage(result.messages[0] ?? null);
    setTotal(result.grandTotal);
  };

  return (
    <div>
      <label htmlFor="coupon-code">Coupon Code</label>
      <input
        id="coupon-code"
        value={code}
        onChange={(event) => setCode(event.target.value)}
      />
      <button type="button" onClick={onApply}>
        Apply Coupon
      </button>
      {message ? <div role="status">{message}</div> : null}
      {total !== null ? <div>Grand Total: {total}</div> : null}
    </div>
  );
}

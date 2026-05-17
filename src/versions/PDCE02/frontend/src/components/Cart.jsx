import React, { useState } from 'react';
import CouponForm from './CouponForm';

const Cart = ({ userId }) => {
  const [cartTotal, setCartTotal] = useState(200);

  return (
    <div>
      <h2>Cart Total: ${cartTotal}</h2>
      <CouponForm
        userId={userId}
        cartTotal={cartTotal}
        onDiscountApplied={(newTotal) => setCartTotal(newTotal)}
      />
    </div>
  );
};

export default Cart;

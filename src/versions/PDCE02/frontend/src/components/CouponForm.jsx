import React, { useState } from 'react';

const CouponForm = ({ userId, cartTotal, onDiscountApplied }) => {
  const [code, setCode] = useState('');

  const applyCoupon = async () => {
    const res = await fetch('http://localhost:5000/api/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, cartTotal, couponCodes: [code] })
    });

    const data = await res.json();
    if (data.finalTotal !== undefined) onDiscountApplied(data.finalTotal);
  };

  return (
    <div>
      <input value={code} onChange={(e)=>setCode(e.target.value)} placeholder="Enter code"/>
      <button onClick={applyCoupon}>Apply</button>
    </div>
  );
};

export default CouponForm;

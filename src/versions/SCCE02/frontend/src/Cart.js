
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function Cart({ userId }) {
  const [cart, setCart] = useState({ items: [], totalCents: 0 });

  const fetchCart = async () => {
    const res = await axios.get(`${API}/api/cart/${userId}`);
    setCart(res.data);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const formatMoney = cents =>
    (cents / 100).toLocaleString(undefined, {
      minimumFractionDigits: 2
    });

  return (
    <div style={{ padding: 20 }}>
      <h2>Shopping Cart</h2>

      {cart.items.map(item => (
        <div key={item.id} style={{ marginBottom: 10 }}>
          <strong>{item.name}</strong>
          <div>Qty: {item.quantity}</div>
          <div>${formatMoney(item.lineTotal)}</div>
        </div>
      ))}

      <h3>Total: ${formatMoney(cart.totalCents)}</h3>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api/cart";

function CartPage() {
  const [cart, setCart] = useState({
    items: [],
    savedForLater: [],
    totalPrice: 0
  });

  const fetchCart = async () => {
    const res = await axios.get(API);
    setCart(res.data);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (id, quantity) => {
    await axios.put(`${API}/update`, { id, quantity });
    fetchCart();
  };

  const saveForLater = async (id) => {
    await axios.post(`${API}/save`, { id });
    fetchCart();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Shopping Cart</h2>

      {cart.items.map(item => (
        <div key={item.id} style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px" }}>
          <h4>{item.name}</h4>
          <p>Price: ${item.price}</p>
          <input
            type="number"
            value={item.quantity}
            min="1"
            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
          />
          <p>Subtotal: ${item.price * item.quantity}</p>
          <button onClick={() => saveForLater(item.id)}>Save for later</button>
        </div>
      ))}

      <h3>Total: ${cart.totalPrice}</h3>

      <h2>Saved For Later</h2>
      {cart.savedForLater.map(item => (
        <div key={item.id}>
          <h4>{item.name}</h4>
          <p>Price: ${item.price}</p>
        </div>
      ))}
    </div>
  );
}

export default CartPage;


import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [products, setProducts] = useState([]);

  const fetchStock = async () => {
    const res = await axios.get("http://localhost:5000/api/stock");
    setProducts(res.data);
  };

  const deduct = async (id) => {
    await axios.post(`http://localhost:5000/api/stock/deduct/${id}`);
    fetchStock();
  };

  const restore = async (id) => {
    await axios.post(`http://localhost:5000/api/stock/restore/${id}`);
    fetchStock();
  };

  useEffect(() => {
    fetchStock();
  }, []);

  return (
    <div>
      <h1>Inventory Dashboard</h1>
      {products.map((p) => (
        <div key={p.id}>
          <strong>{p.name}</strong> - Stock: {p.stock}
          {p.stock <= 5 && <span style={{color:"red"}}> LOW STOCK</span>}
          <button onClick={() => deduct(p.id)}>Deduct</button>
          <button onClick={() => restore(p.id)}>Restore</button>
        </div>
      ))}
    </div>
  );
}

export default App;

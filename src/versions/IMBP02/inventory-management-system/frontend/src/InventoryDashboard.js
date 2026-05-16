
import React, { useEffect, useState } from "react";
import axios from "axios";

const InventoryDashboard = () => {
  const [products, setProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchLowStock();
  }, []);

  const fetchProducts = async () => {
    const res = await axios.get("http://localhost:5000/api/inventory");
    setProducts(res.data);
  };

  const fetchLowStock = async () => {
    const res = await axios.get("http://localhost:5000/api/inventory/low-stock");
    setLowStock(res.data);
  };

  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      <h1>Inventory Dashboard</h1>

      <h2>Current Stock Levels</h2>
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Product</th>
            <th>Stock</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.stock}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ color: "red" }}>Low Stock Items</h2>
      {lowStock.length === 0 ? (
        <p>No low stock items</p>
      ) : (
        <ul>
          {lowStock.map(item => (
            <li key={item.id}>
              {item.name} — {item.stock} remaining
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default InventoryDashboard;

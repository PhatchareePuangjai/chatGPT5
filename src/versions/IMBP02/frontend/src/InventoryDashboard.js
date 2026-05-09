
import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5001/api/inventory";

function InventoryDashboard() {
  const [inventory, setInventory] = useState([]);
  const [lowStock, setLowStock] = useState([]);

  useEffect(() => {
    fetchInventory();
    fetchLowStock();
  }, []);

  const fetchInventory = async () => {
    const res = await axios.get(API_URL);
    setInventory(res.data);
  };

  const fetchLowStock = async () => {
    const res = await axios.get(`${API_URL}/low-stock`);
    setLowStock(res.data);
  };

  const handlePurchase = async (id) => {
    await axios.post(`${API_URL}/purchase/${id}`, { quantity: 1 });
    fetchInventory();
    fetchLowStock();
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Inventory Dashboard</h1>

      <h2>All Products</h2>
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Name</th>
            <th>Stock</th>
            <th>Buy</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map(item => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.stock}</td>
              <td>
                <button onClick={() => handlePurchase(item.id)}>
                  Buy 1
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ color: "red", marginTop: 30 }}>
        Low Stock Items (Less than 5)
      </h2>

      {lowStock.length === 0 ? (
        <p>No low stock items</p>
      ) : (
        <ul>
          {lowStock.map(item => (
            <li key={item.id}>
              {item.name} — {item.stock} left
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default InventoryDashboard;

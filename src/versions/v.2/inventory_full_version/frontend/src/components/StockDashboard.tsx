import React, { useEffect, useState } from 'react';

const API_BASE_URL = 'http://localhost:4000/api/stock';

export interface Product {
  id: number;
  name: string;
  stock: number;
}

interface PurchaseForm {
  productId: string;
  quantity: number;
}

export interface StockHistoryEntry {
  id: number;
  product_id: number;
  product_name: string;
  change: number;
  old_stock: number;
  new_stock: number;
  reason: string;
  metadata: any;
  created_at: string;
}

export interface StockAlertEntry {
  id: number;
  product_id: number;
  product_name: string;
  current_stock: number;
  threshold: number;
  type: string;
  created_at: string;
}

export const StockDashboard: React.FC = () => {
  const [allStock, setAllStock] = useState<Product[]>([]);
  const [lowStock, setLowStock] = useState<Product[]>([]);
  const [history, setHistory] = useState<StockHistoryEntry[]>([]);
  const [alerts, setAlerts] = useState<StockAlertEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [purchaseForm, setPurchaseForm] = useState<PurchaseForm>({
    productId: '',
    quantity: 1,
  });

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [allRes, lowRes, histRes, alertRes] = await Promise.all([
        fetch(API_BASE_URL),
        fetch(`${API_BASE_URL}/low`),
        fetch(`${API_BASE_URL}/history`),
        fetch(`${API_BASE_URL}/alerts`),
      ]);

      if (!allRes.ok || !lowRes.ok || !histRes.ok || !alertRes.ok) {
        throw new Error('Failed to fetch one or more resources');
      }

      const [allData, lowData, histData, alertData] = await Promise.all([
        allRes.json(),
        lowRes.json(),
        histRes.json(),
        alertRes.json(),
      ]);

      setAllStock(allData);
      setLowStock(lowData);
      setHistory(histData);
      setAlerts(alertData);
    } catch (err) {
      console.error('Error fetching stock data:', err);
      setMessage('Error fetching stock/monitoring data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleFormChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setPurchaseForm((prev) => ({
      ...prev,
      [name]: name === 'quantity' ? Number(value) : value,
    }));
  };

  const handlePurchaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    const productIdNum = Number(purchaseForm.productId);
    const quantityNum = Number(purchaseForm.quantity);

    if (!productIdNum || quantityNum <= 0) {
      setMessage('Please select a product and enter a valid quantity.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/order/deduct`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: `demo-${Date.now()}`,
          productId: productIdNum,
          quantity: quantityNum,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || 'Purchase failed.');
      } else {
        setMessage(data.message || 'Purchase successful.');
        await fetchAllData();
      }
    } catch (err) {
      console.error('Error making purchase:', err);
      setMessage('Error making purchase.');
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Inventory Dashboard</h1>

      {/* Purchase section */}
      <section
        style={{
          marginBottom: '2rem',
          padding: '1rem',
          border: '1px solid #ddd',
          borderRadius: '8px',
          background: '#fff',
        }}
      >
        <h2>Simulate Purchase (deduct stock)</h2>
        <form
          onSubmit={handlePurchaseSubmit}
          style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <label>
            Product:
            <select
              name="productId"
              value={purchaseForm.productId}
              onChange={handleFormChange}
              style={{ marginLeft: '0.5rem', minWidth: '220px' }}
            >
              <option value="">Select...</option>
              {allStock.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Stock: {p.stock})
                </option>
              ))}
            </select>
          </label>

          <label>
            Quantity:
            <input
              type="number"
              name="quantity"
              min={1}
              value={purchaseForm.quantity}
              onChange={handleFormChange}
              style={{ marginLeft: '0.5rem', width: '80px' }}
            />
          </label>

          <button type="submit">Buy</button>
        </form>
        {message && <p style={{ marginTop: '0.5rem' }}>{message}</p>}
      </section>

      {/* Current stock */}
      <section
        style={{
          marginBottom: '2rem',
          padding: '1rem',
          borderRadius: '8px',
          background: '#fff',
        }}
      >
        <h2>Current Stock Levels</h2>
        {loading ? (
          <p>Loading...</p>
        ) : allStock.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <table
            style={{
              borderCollapse: 'collapse',
              width: '100%',
              maxWidth: '800px',
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    borderBottom: '1px solid #ccc',
                    textAlign: 'left',
                    padding: '0.5rem',
                  }}
                >
                  ID
                </th>
                <th
                  style={{
                    borderBottom: '1px solid #ccc',
                    textAlign: 'left',
                    padding: '0.5rem',
                  }}
                >
                  Name
                </th>
                <th
                  style={{
                    borderBottom: '1px solid #ccc',
                    textAlign: 'left',
                    padding: '0.5rem',
                  }}
                >
                  Stock
                </th>
              </tr>
            </thead>
            <tbody>
              {allStock.map((p) => (
                <tr key={p.id}>
                  <td
                    style={{
                      borderBottom: '1px solid #eee',
                      padding: '0.5rem',
                    }}
                  >
                    {p.id}
                  </td>
                  <td
                    style={{
                      borderBottom: '1px solid #eee',
                      padding: '0.5rem',
                    }}
                  >
                    {p.name}
                  </td>
                  <td
                    style={{
                      borderBottom: '1px solid #eee',
                      padding: '0.5rem',
                      color: p.stock <= 5 ? 'red' : 'inherit',
                      fontWeight: p.stock <= 5 ? 'bold' : 'normal',
                    }}
                  >
                    {p.stock}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Low stock overview */}
      <section
        style={{
          marginBottom: '2rem',
          padding: '1rem',
          borderRadius: '8px',
          background: '#fff',
        }}
      >
        <h2>Low Stock Items (≤ 5)</h2>
        {lowStock.length === 0 ? (
          <p>None 🎉</p>
        ) : (
          <ul>
            {lowStock.map((p) => (
              <li key={p.id}>
                {p.name} —{' '}
                <span style={{ color: 'red', fontWeight: 'bold' }}>
                  {p.stock}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* History table */}
      <section
        style={{
          marginBottom: '2rem',
          padding: '1rem',
          borderRadius: '8px',
          background: '#fff',
        }}
      >
        <h2>Recent Stock History</h2>
        {history.length === 0 ? (
          <p>No history yet.</p>
        ) : (
          <table
            style={{
              borderCollapse: 'collapse',
              width: '100%',
              maxWidth: '900px',
              fontSize: '0.9rem',
            }}
          >
            <thead>
              <tr>
                <th style={{ borderBottom: '1px solid #ccc', padding: '0.5rem' }}>
                  Time
                </th>
                <th style={{ borderBottom: '1px solid #ccc', padding: '0.5rem' }}>
                  Product
                </th>
                <th style={{ borderBottom: '1px solid #ccc', padding: '0.5rem' }}>
                  Change
                </th>
                <th style={{ borderBottom: '1px solid #ccc', padding: '0.5rem' }}>
                  From → To
                </th>
                <th style={{ borderBottom: '1px solid #ccc', padding: '0.5rem' }}>
                  Reason
                </th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.id}>
                  <td
                    style={{
                      borderBottom: '1px solid #eee',
                      padding: '0.5rem',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {new Date(h.created_at).toLocaleString()}
                  </td>
                  <td
                    style={{
                      borderBottom: '1px solid #eee',
                      padding: '0.5rem',
                    }}
                  >
                    {h.product_name}
                  </td>
                  <td
                    style={{
                      borderBottom: '1px solid #eee',
                      padding: '0.5rem',
                      color: h.change < 0 ? 'red' : 'green',
                      fontWeight: 'bold',
                    }}
                  >
                    {h.change > 0 ? `+${h.change}` : h.change}
                  </td>
                  <td
                    style={{
                      borderBottom: '1px solid #eee',
                      padding: '0.5rem',
                    }}
                  >
                    {h.old_stock} → {h.new_stock}
                  </td>
                  <td
                    style={{
                      borderBottom: '1px solid #eee',
                      padding: '0.5rem',
                    }}
                  >
                    {h.reason}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Alerts table */}
      <section
        style={{
          marginBottom: '2rem',
          padding: '1rem',
          borderRadius: '8px',
          background: '#fff',
        }}
      >
        <h2>Low Stock Alerts Log</h2>
        {alerts.length === 0 ? (
          <p>No alerts yet.</p>
        ) : (
          <table
            style={{
              borderCollapse: 'collapse',
              width: '100%',
              maxWidth: '900px',
              fontSize: '0.9rem',
            }}
          >
            <thead>
              <tr>
                <th style={{ borderBottom: '1px solid #ccc', padding: '0.5rem' }}>
                  Time
                </th>
                <th style={{ borderBottom: '1px solid #ccc', padding: '0.5rem' }}>
                  Product
                </th>
                <th style={{ borderBottom: '1px solid #ccc', padding: '0.5rem' }}>
                  Current Stock
                </th>
                <th style={{ borderBottom: '1px solid #ccc', padding: '0.5rem' }}>
                  Threshold
                </th>
                <th style={{ borderBottom: '1px solid #ccc', padding: '0.5rem' }}>
                  Type
                </th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((a) => (
                <tr key={a.id}>
                  <td
                    style={{
                      borderBottom: '1px solid #eee',
                      padding: '0.5rem',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {new Date(a.created_at).toLocaleString()}
                  </td>
                  <td
                    style={{
                      borderBottom: '1px solid #eee',
                      padding: '0.5rem',
                    }}
                  >
                    {a.product_name}
                  </td>
                  <td
                    style={{
                      borderBottom: '1px solid #eee',
                      padding: '0.5rem',
                      color: 'red',
                      fontWeight: 'bold',
                    }}
                  >
                    {a.current_stock}
                  </td>
                  <td
                    style={{
                      borderBottom: '1px solid #eee',
                      padding: '0.5rem',
                    }}
                  >
                    {a.threshold}
                  </td>
                  <td
                    style={{
                      borderBottom: '1px solid #eee',
                      padding: '0.5rem',
                    }}
                  >
                    {a.type}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};

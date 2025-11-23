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

export const StockDashboard: React.FC = () => {
  const [allStock, setAllStock] = useState<Product[]>([]);
  const [lowStock, setLowStock] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [purchaseForm, setPurchaseForm] = useState<PurchaseForm>({
    productId: '',
    quantity: 1,
  });

  const fetchStock = async () => {
    try {
      setLoading(true);
      const [allRes, lowRes] = await Promise.all([
        fetch(API_BASE_URL),
        fetch(`${API_BASE_URL}/low`),
      ]);

      if (!allRes.ok || !lowRes.ok) {
        throw new Error('Failed to fetch stock data');
      }

      const allData: Product[] = await allRes.json();
      const lowData: Product[] = await lowRes.json();

      setAllStock(allData);
      setLowStock(lowData);
    } catch (err) {
      console.error('Error fetching stock:', err);
      setMessage('Error fetching stock data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  const handleFormChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
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
      const res = await fetch(`${API_BASE_URL}/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: productIdNum,
          quantity: quantityNum,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || 'Purchase failed.');
      } else {
        setMessage(data.message || 'Purchase successful.');
        await fetchStock();
      }
    } catch (err) {
      console.error('Error making purchase:', err);
      setMessage('Error making purchase.');
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Inventory Dashboard</h1>

      <section
        style={{
          marginBottom: '2rem',
          padding: '1rem',
          border: '1px solid #ddd',
          borderRadius: '8px',
        }}
      >
        <h2>Simulate Purchase</h2>
        <form
          onSubmit={handlePurchaseSubmit}
          style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}
        >
          <label>
            Product:
            <select
              name="productId"
              value={purchaseForm.productId}
              onChange={handleFormChange}
              style={{ marginLeft: '0.5rem', minWidth: '200px' }}
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

      <section style={{ marginBottom: '2rem' }}>
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
              maxWidth: '600px',
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
                      color: p.stock < 5 ? 'red' : 'inherit',
                      fontWeight: p.stock < 5 ? 'bold' : 'normal',
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

      <section>
        <h2>Low Stock Items (less than 5)</h2>
        {lowStock.length === 0 ? (
          <p>None 🎉</p>
        ) : (
          <ul>
            {lowStock.map((p) => (
              <li key={p.id}>
                {p.name} —{' '}
                <span style={{ color: 'red', fontWeight: 'bold' }}>{p.stock}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

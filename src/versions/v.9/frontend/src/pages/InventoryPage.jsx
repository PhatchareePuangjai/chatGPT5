import { useState } from 'react';
import DeductStockForm from '../components/DeductStockForm';
import RestoreStockForm from '../components/RestoreStockForm';
import StockAlertsList from '../components/StockAlertsList';
import {
  deductStock,
  getAlerts,
  getInventory,
  restoreStock,
  searchSkus,
} from '../services/inventoryService';
import { toInventoryView } from '../models/inventory';

const InventoryPage = () => {
  const [inventory, setInventory] = useState(null);
  const [message, setMessage] = useState('');
  const [alerts, setAlerts] = useState([]);
  const [errorText, setErrorText] = useState('');
  const [skuQuery, setSkuQuery] = useState('');
  const [skuSuggestions, setSkuSuggestions] = useState([]);
  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

  const handleSkuSearch = async (value) => {
    setSkuQuery(value);
    if (!value.trim()) {
      setSkuSuggestions([]);
      return;
    }
    try {
      const results = await searchSkus(value.trim());
      setSkuSuggestions(results);
    } catch (error) {
      setErrorText(error.message);
    }
  };

  const handleDeduct = async ({ sku, quantity, orderId }) => {
    try {
      setMessage('Processing deduction...');
      setErrorText('');
      await deductStock({ sku, quantity, orderId });
      const [item, alertList] = await Promise.all([
        getInventory(sku),
        getAlerts(sku),
      ]);
      setInventory(toInventoryView(item));
      setAlerts(alertList);
      setMessage('Stock deducted successfully.');
    } catch (error) {
      setErrorText(error.message);
    }
  };

  const handleRestore = async ({ sku, quantity, orderId, reason }) => {
    try {
      setMessage('Processing restore...');
      setErrorText('');
      await restoreStock({ sku, quantity, orderId, reason });
      const [item, alertList] = await Promise.all([
        getInventory(sku),
        getAlerts(sku),
      ]);
      setInventory(toInventoryView(item));
      setAlerts(alertList);
      setMessage('Stock restored successfully.');
    } catch (error) {
      setErrorText(error.message);
    }
  };

  return (
    <section>
      <div className="card">
        <h2>แดชบอร์ดสต็อก</h2>
        <p className="muted">API ที่ใช้งาน: {apiBaseUrl}</p>
        {message && <div className="status">{message}</div>}
        {errorText && <div className="status error">{errorText}</div>}
        <div className="field">
          <label>ค้นหารหัสสินค้า (SKU)</label>
          <input
            value={skuQuery}
            onChange={(e) => handleSkuSearch(e.target.value)}
            placeholder="พิมพ์ SKU เพื่อค้นหา"
          />
          {skuSuggestions.length > 0 && (
            <p className="muted">พบ: {skuSuggestions.join(', ')}</p>
          )}
        </div>
      </div>
      <div className="grid grid-2">
        <DeductStockForm
          onSubmit={handleDeduct}
          skuSuggestions={skuSuggestions}
        />
        <RestoreStockForm
          onSubmit={handleRestore}
          skuSuggestions={skuSuggestions}
        />
      </div>
      {inventory && (
        <div className="card">
          <h4>สถานะสต็อก</h4>
          <p>SKU: {inventory.sku}</p>
          <p>คงเหลือ: {inventory.quantity}</p>
          <p>เกณฑ์แจ้งเตือน: {inventory.lowStockThreshold}</p>
        </div>
      )}
      <StockAlertsList alerts={alerts} />
    </section>
  );
};

export default InventoryPage;

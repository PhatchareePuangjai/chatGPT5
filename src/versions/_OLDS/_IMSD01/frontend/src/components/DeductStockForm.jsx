import { useState } from 'react';

const DeductStockForm = ({ onSubmit, skuSuggestions = [] }) => {
  const [sku, setSku] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [orderId, setOrderId] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({ sku, quantity: Number(quantity), orderId });
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <h3>ตัดสต็อก</h3>
      <div className="field">
        <label>รหัสสินค้า (SKU)</label>
        <input
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          placeholder="SKU-001"
          list="sku-suggestions-deduct"
        />
        <datalist id="sku-suggestions-deduct">
          {skuSuggestions.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
      </div>
      <div className="field">
        <label>จำนวน</label>
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
      </div>
      <div className="field">
        <label>เลขคำสั่งซื้อ</label>
        <input
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="order-123"
        />
      </div>
      <button type="submit" className="button">
        ยืนยันตัดสต็อก
      </button>
    </form>
  );
};

export default DeductStockForm;

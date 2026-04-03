import { useState } from 'react';

const RestoreStockForm = ({ onSubmit, skuSuggestions = [] }) => {
  const [sku, setSku] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [orderId, setOrderId] = useState('');
  const [reason, setReason] = useState('canceled');

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({ sku, quantity: Number(quantity), orderId, reason });
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <h3>คืนสต็อก</h3>
      <div className="field">
        <label>รหัสสินค้า (SKU)</label>
        <input
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          placeholder="SKU-003"
          list="sku-suggestions-restore"
        />
        <datalist id="sku-suggestions-restore">
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
          placeholder="order-456"
        />
      </div>
      <div className="field">
        <label>เหตุผล</label>
        <select value={reason} onChange={(e) => setReason(e.target.value)}>
          <option value="canceled">ยกเลิก</option>
          <option value="expired">หมดอายุ</option>
        </select>
      </div>
      <button type="submit" className="button">
        ยืนยันคืนสต็อก
      </button>
    </form>
  );
};

export default RestoreStockForm;

import { useState } from 'react';
import { useCart } from './hooks/useCart.js';
import { CartSummary } from './components/CartSummary.jsx';

export default function App() {
  const [couponCode, setCouponCode] = useState('');
  const { cart, loading, submitting, feedback, setFeedback, applyCoupon } = useCart();

  const handleSubmit = async (event) => {
    event.preventDefault();
    await applyCoupon(couponCode);
    setCouponCode('');
  };

  return (
    <main>
      <h1>ระบบโปรโมชั่น & คูปอง</h1>
      {feedback && (
        <div className={`alert ${feedback.type === 'success' ? 'alert-success' : 'alert-error'}`} role="alert">
          <button
            type="button"
            onClick={() => setFeedback(null)}
            style={{ float: 'right', border: 'none', background: 'transparent', cursor: 'pointer' }}
            aria-label="dismiss"
          >
            ×
          </button>
          {feedback.message}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <input
          value={couponCode}
          onChange={(event) => setCouponCode(event.target.value)}
          placeholder="กรอกรหัสคูปอง"
          aria-label="coupon code"
        />
        <button type="submit" disabled={submitting || !couponCode}>
          {submitting ? 'กำลังตรวจสอบ...' : 'ใช้คูปอง'}
        </button>
      </form>
      {loading ? <p>กำลังโหลดตะกร้า...</p> : <CartSummary cart={cart} />}
    </main>
  );
}

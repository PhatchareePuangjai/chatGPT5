import { useState } from 'react'

interface PromotionResult {
  original_total: number
  discount_amount: number
  final_total: number
  message: string
}

function App() {
  const [cartTotal, setCartTotal] = useState<number>(1000)
  const [couponInput, setCouponInput] = useState<string>('')
  const [appliedCoupons, setAppliedCoupons] = useState<string[]>([])
  const [result, setResult] = useState<PromotionResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleApplyCoupon = async () => {
    setError(null)
    const couponsToApply = [...appliedCoupons]
    if (couponInput && !couponsToApply.includes(couponInput)) {
      couponsToApply.push(couponInput)
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const res = await fetch(`${apiUrl}/api/calculate_discount`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cart_total: cartTotal,
          coupons: couponsToApply,
          user_id: 'user123', // fixed for mock
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.detail || 'Error applying coupon')
      } else {
        setResult(data)
        if (couponInput && !appliedCoupons.includes(couponInput)) {
            setAppliedCoupons(couponsToApply)
        }
        setCouponInput('')
      }
    } catch (err) {
      setError('Network error connecting to backend')
    }
  }

  const handleReset = () => {
    setAppliedCoupons([])
    setResult(null)
    setError(null)
    setCouponInput('')
  }

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>Shopping Cart (Promotions Test)</h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h3>Cart Settings</h3>
        <label>
          Cart Total (THB): 
          <input 
            type="number" 
            value={cartTotal} 
            onChange={(e) => {
              setCartTotal(Number(e.target.value))
              setResult(null)
            }}
            style={{ marginLeft: '10px' }}
          />
        </label>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h3>Apply Coupon</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            placeholder="Enter promo code" 
            value={couponInput}
            onChange={(e) => setCouponInput(e.target.value)}
          />
          <button onClick={handleApplyCoupon}>Apply</button>
        </div>
        
        {appliedCoupons.length > 0 && (
          <div style={{ marginTop: '10px' }}>
            <strong>Applied: </strong> {appliedCoupons.join(', ')}
            <button onClick={handleReset} style={{ marginLeft: '10px', fontSize: '12px' }}>Reset</button>
          </div>
        )}
        
        {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
      </div>

      <div style={{ padding: '15px', border: '1px solid #000', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
        <h3>Order Summary</h3>
        <p>Subtotal: {cartTotal} THB</p>
        
        {result && (
          <>
            <p style={{ color: 'green' }}>Discount: -{result.discount_amount} THB</p>
            <h2 style={{ borderTop: '1px solid #ccc', paddingTop: '10px' }}>
              Total: {result.final_total} THB
            </h2>
            <p style={{ fontStyle: 'italic', color: '#555' }}>Status: {result.message}</p>
          </>
        )}
      </div>

      <div style={{ marginTop: '30px', fontSize: '12px', color: '#666' }}>
        <p>Available Mock Coupons:</p>
        <ul>
          <li><strong>SAVE100</strong>: 100 THB off (Min 500)</li>
          <li><strong>10PERCENT</strong>: 10% off</li>
          <li><strong>EXPIRED</strong>: Expired coupon check</li>
          <li><strong>WELCOME</strong>: Limit 1 per user (user123 used it)</li>
        </ul>
      </div>
    </div>
  )
}

export default App

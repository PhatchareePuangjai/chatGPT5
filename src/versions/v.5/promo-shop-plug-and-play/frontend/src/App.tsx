import React, { useEffect, useMemo, useState } from "react";
import { CartItem, Product, QuoteResponse, confirm, formatBaht, getProducts, quote } from "./api";
import { loadCart, loadSaved, loadUserId, saveCart, saveSaved, saveUserId } from "./storage";
import Toast, { ToastState } from "./Toast";

function clampQty(n: number) {
  if (!Number.isFinite(n)) return 1;
  const i = Math.round(n);
  return Math.max(1, Math.min(99, i));
}

function mergeItem(list: CartItem[], item: CartItem): CartItem[] {
  const i = list.findIndex(x => x.productId === item.productId);
  if (i >= 0) {
    const next = [...list];
    next[i] = { ...next[i], qty: clampQty(next[i].qty + item.qty) };
    return next;
  }
  return [...list, item];
}

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>(loadCart());
  const [saved, setSaved] = useState<CartItem[]>(loadSaved());
  const [userId, setUserId] = useState(loadUserId());
  const [couponCode, setCouponCode] = useState<string>("SAVE100");
  const [quoteResult, setQuoteResult] = useState<QuoteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(() => setProducts([]));
  }, []);

  useEffect(() => { saveCart(cart); }, [cart]);
  useEffect(() => { saveSaved(saved); }, [saved]);
  useEffect(() => { saveUserId(userId); }, [userId]);

  const productMap = useMemo(() => new Map(products.map(p => [p.id, p])), [products]);

  const canCheckout = cart.length > 0 && userId.trim().length > 0;

  function addToCart(productId: string) {
    const p = productMap.get(productId);
    if (!p) return;
    if (p.stock <= 0) {
      setToast({ kind: "err", title: "Out of stock", message: `${p.name} is not available right now.` });
      return;
    }
    setCart(prev => mergeItem(prev, { productId, qty: 1 }));
    setToast({ kind: "ok", title: "Added to cart", message: `${p.name} added.` });
  }

  function updateQty(productId: string, qty: number) {
    setCart(prev => prev.map(x => x.productId === productId ? { ...x, qty: clampQty(qty) } : x));
  }

  function removeItem(productId: string) {
    const p = productMap.get(productId);
    setCart(prev => prev.filter(x => x.productId !== productId));
    setToast({ kind: "ok", title: "Removed", message: p ? `${p.name} removed from cart.` : "Removed from cart." });
  }

  function saveForLater(productId: string) {
    const it = cart.find(x => x.productId === productId);
    if (!it) return;
    const p = productMap.get(productId);
    setCart(prev => prev.filter(x => x.productId !== productId));
    setSaved(prev => mergeItem(prev, it));
    setToast({ kind: "ok", title: "Saved for later", message: p ? `${p.name} moved to saved items.` : "Saved." });
  }

  function moveToCart(productId: string) {
    const it = saved.find(x => x.productId === productId);
    if (!it) return;
    const p = productMap.get(productId);
    if (p && p.stock <= 0) {
      setToast({ kind: "err", title: "Out of stock", message: `${p.name} is not available right now.` });
      return;
    }
    setSaved(prev => prev.filter(x => x.productId !== productId));
    setCart(prev => mergeItem(prev, it));
    setToast({ kind: "ok", title: "Moved to cart", message: p ? `${p.name} moved back to cart.` : "Moved." });
  }

  async function runQuote(showPopupOnError = false) {
    setLoading(true);
    try {
      const res = await quote({ userId, items: cart, couponCode: couponCode.trim() || undefined });
      setQuoteResult(res);

      if (res.messages?.length) {
        setToast({ kind: "ok", title: res.messages[0], message: res.appliedCoupon ? `Coupon ${res.appliedCoupon.code} applied.` : undefined });
      }
      if (showPopupOnError && res.errors?.length) {
        setToast({ kind: "err", title: "Cannot apply coupon", message: res.errors[0] });
      }
    } catch {
      setToast({ kind: "err", title: "Network error", message: "Please try again." });
    } finally {
      setLoading(false);
    }
  }

  async function runConfirm() {
    setLoading(true);
    try {
      const res = await confirm({ userId, items: cart, couponCode: couponCode.trim() || undefined });
      setQuoteResult(res);

      if (!res.ok) {
        setToast({ kind: "err", title: "Checkout failed", message: res.errors?.[0] || "Please try again." });
        return;
      }

      setToast({ kind: "ok", title: "Payment complete", message: "Thank you! Stock has been updated." });
      setCart([]);
      setCouponCode("");
      // Refresh product stock after purchase
      const fresh = await getProducts();
      setProducts(fresh);
    } catch {
      setToast({ kind: "err", title: "Network error", message: "Please try again." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (products.length) runQuote(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products.length]);

  return (
    <div className="container">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="header">
        <div className="brand">
          <h1>Plug &amp; Play Promo Shop</h1>
          <p>
            Automatic discount: <span className="pill">10% off</span> applied first, then coupon.
            Totals are always clear and never go below 0.
          </p>
        </div>

        <div className="card card-pad" style={{ width: 320, maxWidth: "100%" }}>
          <div className="field">
            <div className="label">User ID (for one-time coupon tracking)</div>
            <input className="input" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="e.g. toy" />
            <div className="muted">
              Tip: try <span className="pill">WELCOME</span> (one time per user) or <span className="pill">SAVE100</span> (min 500).
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        {/* Products */}
        <div className="card card-pad">
          <div className="split">
            <h2 className="section-title">Products</h2>
            <div className="muted">Prices and stock are controlled by the server.</div>
          </div>

          <table className="table" aria-label="Products">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Stock</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                      <strong>{p.name}</strong> <span className="pill">{p.id}</span>
                    </div>
                  </td>
                  <td>{formatBaht(p.price_satang)} baht</td>
                  <td>{p.stock}</td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn btn-primary btn-lg" onClick={() => addToCart(p.id)} disabled={loading || p.stock <= 0}>
                      Add
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="divider" />
          <div className="muted">
            Test coupons: <span className="pill">SAVE100</span>, <span className="pill">WELCOME</span>, <span className="pill">EXPIRED10</span>
          </div>
        </div>

        {/* Cart */}
        <div className="card card-pad">
          <h2 className="section-title">Cart</h2>

          {cart.length === 0 ? (
            <p className="muted">Your cart is empty. Add a product to begin.</p>
          ) : (
            <table className="table" aria-label="Cart items">
              <thead>
                <tr>
                  <th>Item</th>
                  <th style={{ width: 120 }}>Qty</th>
                  <th>Line</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cart.map(it => {
                  const p = productMap.get(it.productId);
                  if (!p) return null;
                  return (
                    <tr key={it.productId}>
                      <td>
                        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                          <strong>{p.name}</strong> <span className="pill">{p.id}</span>
                        </div>
                        <div className="muted">Available stock: {p.stock}</div>
                      </td>
                      <td>
                        <input
                          className="input qty"
                          type="number"
                          min={1}
                          max={99}
                          value={it.qty}
                          onChange={(e) => updateQty(it.productId, parseInt(e.target.value || "1", 10))}
                        />
                      </td>
                      <td>{formatBaht(p.price_satang * it.qty)} baht</td>
                      <td>
                        <div className="row-actions">
                          <button className="btn btn-ghost btn-lg" onClick={() => saveForLater(it.productId)} disabled={loading}>
                            Save for Later
                          </button>
                          <button className="btn btn-danger btn-lg" onClick={() => removeItem(it.productId)} disabled={loading}>
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* Saved for later */}
          {saved.length > 0 && (
            <>
              <div className="divider" />
              <h2 className="section-title">Saved for Later</h2>
              <table className="table" aria-label="Saved items">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th style={{ width: 120 }}>Qty</th>
                    <th style={{ textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {saved.map(it => {
                    const p = productMap.get(it.productId);
                    if (!p) return null;
                    return (
                      <tr key={it.productId}>
                        <td>
                          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                            <strong>{p.name}</strong> <span className="pill">{p.id}</span>
                          </div>
                          <div className="muted">Available stock: {p.stock}</div>
                        </td>
                        <td>{it.qty}</td>
                        <td style={{ textAlign: "right" }}>
                          <button className="btn btn-primary btn-lg" onClick={() => moveToCart(it.productId)} disabled={loading}>
                            Move to Cart
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </>
          )}

          <div className="divider" />

          <div className="field">
            <div className="label">Coupon Code</div>
            <input
              className="input"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="e.g. SAVE100"
            />
          </div>

          <div className="footer-actions">
            <button className="btn btn-ghost btn-lg" onClick={() => runQuote(true)} disabled={loading}>
              Update Total
            </button>
            <button className="btn btn-primary btn-lg" onClick={runConfirm} disabled={loading || !canCheckout}>
              Pay Now
            </button>
          </div>

          {/* Totals box (clear and large) */}
          <div style={{ marginTop: 12 }}>
            <div className="totals" aria-label="Totals">
              <div className="line"><span>Subtotal</span><strong>{formatBaht(quoteResult?.pricing.subtotal_satang ?? 0)} baht</strong></div>
              <div className="line"><span>Automatic discount (10%)</span><strong>- {formatBaht(quoteResult?.pricing.auto_discount_satang ?? 0)} baht</strong></div>
              <div className="line"><span>After auto discount</span><strong>{formatBaht(quoteResult?.pricing.subtotal_after_auto_satang ?? 0)} baht</strong></div>
              <div className="line"><span>Coupon discount</span><strong>- {formatBaht(quoteResult?.pricing.coupon_discount_satang ?? 0)} baht</strong></div>
              <div className="divider" />
              <div className="line">
                <span className="big">Final Total</span>
                <span className="big">{formatBaht(quoteResult?.pricing.total_satang ?? 0)} baht</span>
              </div>
              <div className="muted">
                Rule: <span className="pill">10% first</span> then <span className="pill">coupon</span>. Total never below 0.
              </div>
            </div>
          </div>

          {quoteResult?.appliedCoupon ? (
            <div className="muted" style={{ marginTop: 10 }}>
              Applied coupon: <span className="pill">{quoteResult.appliedCoupon.code}</span> (expires{" "}
              {new Date(quoteResult.appliedCoupon.expires_at).toLocaleString()})
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

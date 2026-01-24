import { useCallback, useEffect, useState } from 'react';
import { applyCoupon, fetchCart } from '../lib/api.js';

export function useCart(userId = 'demo-user') {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const loadCart = useCallback(async () => {
    setLoading(true);
    try {
      const snapshot = await fetchCart(userId);
      setCart(snapshot);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const handleApplyCoupon = useCallback(
    async (code) => {
      if (!code) return;
      setSubmitting(true);
      try {
        const result = await applyCoupon({ couponCode: code, userId });
        setCart(result.cart);
        setFeedback({ type: 'success', message: result.message });
      } catch (error) {
        setFeedback({ type: 'error', message: error.message });
      } finally {
        setSubmitting(false);
      }
    },
    [userId]
  );

  return {
    cart,
    loading,
    submitting,
    feedback,
    setFeedback,
    applyCoupon: handleApplyCoupon,
    refresh: loadCart,
  };
}

const API_BASE = (import.meta.env && import.meta.env.VITE_API_BASE) || '';

async function request(path, options = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const error = new Error(errorBody.error || 'เกิดข้อผิดพลาด');
    error.reason = errorBody.reason;
    throw error;
  }

  return response.json();
}

export function fetchCart(userId = 'demo-user') {
  const search = new URLSearchParams({ userId });
  return request(`/api/cart?${search.toString()}`);
}

export function applyCoupon({ couponCode, userId = 'demo-user' }) {
  return request('/api/promotions/apply', {
    method: 'POST',
    body: JSON.stringify({ couponCode, userId }),
  });
}

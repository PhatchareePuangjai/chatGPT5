// frontend/src/money.js
export function formatCents(cents) {
  const n = Number(cents || 0);
  // integer cents -> exact 2dp string
  return (n / 100).toFixed(2);
}

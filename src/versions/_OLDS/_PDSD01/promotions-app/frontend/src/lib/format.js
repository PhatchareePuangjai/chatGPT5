export function formatCurrencyFromCents(cents) {
  return (cents / 100).toLocaleString('th-TH', { style: 'currency', currency: 'THB' });
}

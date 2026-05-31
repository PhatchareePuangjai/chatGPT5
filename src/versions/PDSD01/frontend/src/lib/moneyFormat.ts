export type Money = { currency: string; amount: number };

export function formatMoney(m: Money): string {
  if (m.currency === 'THB') {
    const baht = m.amount / 100;
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(baht);
  }
  return `${m.amount} ${m.currency}`;
}

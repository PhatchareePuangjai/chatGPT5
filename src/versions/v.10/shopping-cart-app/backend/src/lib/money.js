export function multiplyCents(amountCents, qty) {
  return Number(amountCents || 0) * Number(qty || 0);
}

export function sumCents(values) {
  return values.reduce((total, value) => total + Number(value || 0), 0);
}

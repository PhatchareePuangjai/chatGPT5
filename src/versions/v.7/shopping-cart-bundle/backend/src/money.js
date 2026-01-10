function assertInteger(n, name) {
  if (!Number.isInteger(n)) {
    const err = new Error(`${name} must be an integer`);
    err.status = 400;
    throw err;
  }
}

function centsToUsdString(cents) {
  assertInteger(cents, "cents");
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  const dollars = Math.floor(abs / 100);
  const remainder = abs % 100;
  return `${sign}${dollars}.${String(remainder).padStart(2, "0")}`;
}

module.exports = { assertInteger, centsToUsdString };

function ensureInteger(value) {
  if (!Number.isFinite(value)) {
    throw new Error('Value must be numeric');
  }
  return Math.round(value);
}

function percentOf(cents, percent) {
  return ensureInteger(Math.round((cents * Number(percent)) / 100));
}

function clampZero(cents) {
  return Math.max(0, ensureInteger(cents));
}

function sumCents(values) {
  return values.reduce((acc, value) => acc + ensureInteger(value), 0);
}

module.exports = {
  percentOf,
  clampZero,
  sumCents,
};


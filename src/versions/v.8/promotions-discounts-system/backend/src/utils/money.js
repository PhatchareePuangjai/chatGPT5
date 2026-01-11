/**
 * Money utilities (satang-based integer math).
 * 1 THB = 100 satang.
 */
function thbToSatang(thb) {
  // Accept number or string like "123.45"
  const s = String(thb).trim();
  if (!/^-?\d+(\.\d{0,2})?$/.test(s)) {
    throw new Error("Invalid THB amount format");
  }
  const negative = s.startsWith("-");
  const [whole, frac = ""] = s.replace("-", "").split(".");
  const frac2 = (frac + "00").slice(0, 2);
  const satang = parseInt(whole, 10) * 100 + parseInt(frac2, 10);
  return negative ? -satang : satang;
}

function satangToTHBString(satang) {
  const neg = satang < 0;
  const abs = Math.abs(satang);
  const whole = Math.floor(abs / 100);
  const frac = String(abs % 100).padStart(2, "0");
  return (neg ? "-" : "") + `${whole}.${frac}`;
}

function calcPercentDiscount(originalSatang, percentBps) {
  // percentBps in [0..10000]. Use floor to avoid over-discount due to rounding.
  // Example: 10% => 1000 bps. discount = floor(original * 1000 / 10000).
  if (!Number.isInteger(originalSatang) || originalSatang < 0) throw new Error("originalSatang must be a non-negative integer");
  if (!Number.isInteger(percentBps) || percentBps < 0 || percentBps > 10000) throw new Error("percentBps out of range");
  return Math.floor((originalSatang * percentBps) / 10000);
}

module.exports = {
  thbToSatang,
  satangToTHBString,
  calcPercentDiscount,
};

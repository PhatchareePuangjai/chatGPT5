import { formatCurrencyFromCents } from '../lib/format.js';

export function CartSummary({ cart }) {
  if (!cart) return null;
  return (
    <section>
      <p>
        <strong>ยอดรวมสินค้า:</strong> {formatCurrencyFromCents(cart.subtotal_cents)}
      </p>
      <div>
        <strong>ส่วนลดที่ใช้:</strong>
        {cart.discounts && cart.discounts.length > 0 ? (
          cart.discounts.map((discount) => (
            <div key={discount.code} className="discount-line">
              <span>
                {discount.code} ({discount.type})
              </span>
              <span>-{formatCurrencyFromCents(discount.amount_cents)}</span>
            </div>
          ))
        ) : (
          <p>ไม่มีส่วนลด</p>
        )}
      </div>
      <p>
        <strong>ยอดชำระ:</strong> {formatCurrencyFromCents(cart.grand_total_cents)}
      </p>
    </section>
  );
}

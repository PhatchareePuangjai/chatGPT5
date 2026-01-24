class PromotionError extends Error {
  constructor(message, status = 400, reason = 'promotion_error') {
    super(message);
    this.status = status;
    this.reason = reason;
  }
}

const errorFactory = {
  expired: () => new PromotionError('คูปองหมดอายุ', 400, 'expired'),
  minSpend: () => new PromotionError('ยอดซื้อไม่ถึงขั้นต่ำ', 400, 'min_spend_failed'),
  usageLimit: () => new PromotionError('คุณใช้สิทธิ์ครบแล้ว', 400, 'usage_limit'),
  duplicate: () => new PromotionError('คูปองนี้ถูกใช้แล้วในตะกร้า', 400, 'duplicate'),
  notFound: () => new PromotionError('ไม่พบคูปองนี้', 404, 'not_found'),
};

module.exports = { PromotionError, errorFactory };

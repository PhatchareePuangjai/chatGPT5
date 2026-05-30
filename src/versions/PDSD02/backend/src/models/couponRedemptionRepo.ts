const redemptionKey = new Set<string>();

export function hasRedeemedCouponForUser(couponId: string, userId: string): boolean {
  return redemptionKey.has(`${couponId}:${userId}`);
}

export function recordRedemption(couponId: string, userId: string) {
  redemptionKey.add(`${couponId}:${userId}`);
}


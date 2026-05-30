export function demoCart(subtotalSatang: number) {
  return {
    cartId: 'demo-cart',
    userId: 'demo-user',
    currency: 'THB' as const,
    subtotalSatang,
  };
}


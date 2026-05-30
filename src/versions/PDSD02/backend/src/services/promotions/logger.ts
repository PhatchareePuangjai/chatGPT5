export function logPromotionOutcome(fields: {
  cartId: string;
  userId: string;
  outcome: 'APPLIED' | 'REJECTED';
  reasonCode?: string;
}) {
  // Replace with structured logger once the project selects one.
  // eslint-disable-next-line no-console
  console.log('[promotions]', JSON.stringify(fields));
}


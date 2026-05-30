import type { Promotion } from '../services/promotions/types';

const promotions: Promotion[] = [
  { id: 'p1', name: '10% off', percentBasisPoints: 1000, isActive: true },
];

export function listActivePromotions(): Promotion[] {
  return promotions.filter((p) => p.isActive);
}


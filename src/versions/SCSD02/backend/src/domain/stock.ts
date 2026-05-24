export function assertWithinStock(params: {
  currentCartQty: number;
  requestedAdditionalQty: number;
  availableStockQty: number;
}): void {
  const { currentCartQty, requestedAdditionalQty, availableStockQty } = params;
  if (!Number.isInteger(currentCartQty) || currentCartQty < 0) {
    throw new Error(`Invalid currentCartQty: ${currentCartQty}`);
  }
  if (!Number.isInteger(requestedAdditionalQty) || requestedAdditionalQty < 0) {
    throw new Error(`Invalid requestedAdditionalQty: ${requestedAdditionalQty}`);
  }
  if (!Number.isInteger(availableStockQty) || availableStockQty < 0) {
    throw new Error(`Invalid availableStockQty: ${availableStockQty}`);
  }
  if (currentCartQty + requestedAdditionalQty > availableStockQty) {
    const err = new Error('Insufficient stock');
    // Tag for error mapping.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (err as any).code = 'INSUFFICIENT_STOCK';
    throw err;
  }
}


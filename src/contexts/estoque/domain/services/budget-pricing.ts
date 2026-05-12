import {
  sumProductBatchQuantities,
  type ProductBatch,
} from '../entities/product-batch';

export type FifoSimulation = {
  totalCost: number;
  totalAvailable: number;
};

export function simulateFifoCost(
  batches: ProductBatch[],
  quantity: number,
): FifoSimulation {
  const totalAvailable = sumProductBatchQuantities(batches);
  let remaining = Math.min(quantity, totalAvailable);
  let totalCost = 0;
  for (const batch of batches) {
    if (remaining === 0) break;
    const take = Math.min(batch.quantity, remaining);
    totalCost += take * batch.salePrice;
    remaining -= take;
  }
  return { totalCost, totalAvailable };
}

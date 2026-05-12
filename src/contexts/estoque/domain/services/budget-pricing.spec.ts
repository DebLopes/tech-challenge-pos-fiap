import { describe, expect, it } from '@jest/globals';
import { ProductBatch } from '../entities/product-batch';
import { simulateFifoCost } from './budget-pricing';

describe('simulateFifoCost', () => {
  it('returns zeros when there is no stock', () => {
    const r = simulateFifoCost([], 10);
    expect(r).toEqual({ totalAvailable: 0, totalCost: 0 });
  });

  it('caps remaining quantity to total available', () => {
    const batches: ProductBatch[] = [
      ProductBatch.create({
        productCode: 'P1',
        quantity: 2,
        costPrice: 1,
        salePrice: 10,
      }),
    ];
    const r = simulateFifoCost(batches, 999);
    expect(r.totalAvailable).toBe(2);
    expect(r.totalCost).toBe(20);
  });

  it('simulates FIFO cost across multiple batches', () => {
    const batches: ProductBatch[] = [
      ProductBatch.create({
        productCode: 'P1',
        quantity: 3,
        costPrice: 1,
        salePrice: 10,
      }),
      ProductBatch.create({
        productCode: 'P1',
        quantity: 4,
        costPrice: 2,
        salePrice: 20,
      }),
    ];
    const r = simulateFifoCost(batches, 5);
    expect(r.totalAvailable).toBe(7);
    expect(r.totalCost).toBe(3 * 10 + 2 * 20);
  });
});

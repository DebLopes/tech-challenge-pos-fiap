import { describe, expect, it } from '@jest/globals';
import { EntityNotFoundError } from '../../../../shared/domain/errors';
import { Product } from '../../../domain/entities/product';
import {
  ProductBatch,
  type ProductBatchProps,
} from '../../../domain/entities/product-batch';
import type { ProductRepositoryInterface } from '../../../domain/repositories/product.repository';
import { ProductBatchRepositoryInterface } from '../../../domain/repositories/product-batch.repository';
import { CreateProductBatchUseCase } from './create-product-batch';
import { GetProductBatchUseCase } from './get-product-batch';

class InMemoryProductRepository implements ProductRepositoryInterface {
  public products = new Map<string, Product>();

  create(data: Product): Promise<Product> {
    this.products.set(data.code, data);
    return Promise.resolve(data);
  }
  find(): Promise<Product[]> {
    return Promise.resolve([...this.products.values()]);
  }
  findByCodeOrNull(code: string): Promise<Product | null> {
    return Promise.resolve(this.products.get(code) ?? null);
  }
  findByCode(code: string): Promise<Product> {
    const p = this.products.get(code);
    if (!p) throw new EntityNotFoundError('Product not found');
    return Promise.resolve(p);
  }
  updateByCode(): Promise<Product> {
    throw new Error('not used');
  }
  remove(): Promise<void> {
    return Promise.resolve();
  }
}

class InMemoryProductBatchRepository implements ProductBatchRepositoryInterface {
  public batches = new Map<string, ProductBatch>();

  create(data: ProductBatch): Promise<ProductBatch> {
    this.batches.set(data.id, data);
    return Promise.resolve(data);
  }

  find(): Promise<ProductBatch[]> {
    return Promise.resolve([...this.batches.values()]);
  }

  findByCodeProduct(productCode: string): Promise<ProductBatch[]> {
    return Promise.resolve(
      [...this.batches.values()].filter(
        (batch) => batch.productCode === productCode,
      ),
    );
  }

  findAvailableByCode(productCode: string): Promise<ProductBatch[]> {
    return Promise.resolve(
      [...this.batches.values()].filter(
        (batch) => batch.productCode === productCode && batch.quantity > 0,
      ),
    );
  }

  updateById(
    id: string,
    dataUpdate: Partial<ProductBatchProps>,
  ): Promise<ProductBatch> {
    const current = this.batches.get(id);
    if (!current) {
      throw new EntityNotFoundError('ProductBatch not found');
    }
    const merged = ProductBatch.create(
      {
        productCode: dataUpdate.productCode ?? current.productCode,
        quantity: dataUpdate.quantity ?? current.quantity,
        costPrice: dataUpdate.costPrice ?? current.costPrice,
        salePrice: dataUpdate.salePrice ?? current.salePrice,
      },
      id,
    );
    this.batches.set(id, merged);
    return Promise.resolve(merged);
  }

  remove(id: string): Promise<void> {
    this.batches.delete(id);
    return Promise.resolve();
  }
}

describe('Product batch use cases', () => {
  it('creates a product batch when product exists', async () => {
    const productRepo = new InMemoryProductRepository();
    const repository = new InMemoryProductBatchRepository();
    await productRepo.create(
      Product.create({ code: 'FILTRO01', name: 'Filtro de ar' }),
    );
    const useCase = new CreateProductBatchUseCase(productRepo, repository);

    const response = await useCase.execute({
      productCode: 'FILTRO01',
      quantity: 10,
      costPrice: 50,
      salePrice: 90,
    });

    expect(response.batch.productCode).toBe('FILTRO01');
    expect(response.productName).toBe('Filtro de ar');
    expect(response.batch.quantity).toBe(10);
    expect(repository.batches.size).toBe(1);
  });

  it('does not create a product batch when product does not exist', async () => {
    const productRepo = new InMemoryProductRepository();
    const repository = new InMemoryProductBatchRepository();
    const useCase = new CreateProductBatchUseCase(productRepo, repository);

    await expect(
      useCase.execute({
        productCode: 'FILTRO01',
        quantity: 10,
        costPrice: 50,
        salePrice: 90,
      }),
    ).rejects.toBeInstanceOf(EntityNotFoundError);
  });

  it('gets batches by product code', async () => {
    const productRepo = new InMemoryProductRepository();
    await productRepo.create(
      Product.create({ code: 'FILTRO01', name: 'Filtro' }),
    );
    const repository = new InMemoryProductBatchRepository();
    await repository.create(
      ProductBatch.create({
        productCode: 'FILTRO01',
        quantity: 10,
        costPrice: 50,
        salePrice: 90,
      }),
    );
    await repository.create(
      ProductBatch.create({
        productCode: 'OLEO01',
        quantity: 3,
        costPrice: 35,
        salePrice: 70,
      }),
    );
    const useCase = new GetProductBatchUseCase(productRepo, repository);

    const response = await useCase.execute('FILTRO01');

    expect(response).toHaveLength(1);
    expect(response[0].batch.productCode).toBe('FILTRO01');
    expect(response[0].productName).toBe('Filtro');
  });
});

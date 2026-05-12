import { describe, expect, it } from '@jest/globals';
import { Product } from '../../../domain/entities/product';
import { ProductRepositoryInterface } from '../../../domain/repositories/product.repository';
import { CreateProductUseCase } from './create-product';
import { DeleteProductUseCase } from './delete-product';
import { GetAllProductUseCase } from './get-all-product';
import { GetProductUseCase } from './get-product';
import { UpdateProductUseCase } from './update-product';

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
    if (!p) throw new Error('not found');
    return Promise.resolve(p);
  }

  updateByCode(code: string, dataUpdate: Partial<Product>): Promise<Product> {
    const current = this.products.get(code);
    if (!current) throw new Error('not found');
    const updated = Product.create(
      {
        code: current.code,
        name: dataUpdate.name ?? current.name,
        description:
          dataUpdate.description !== undefined
            ? dataUpdate.description
            : current.description,
      },
      current.id,
    );
    this.products.set(code, updated);
    return Promise.resolve(updated);
  }

  remove(code: string): Promise<void> {
    this.products.delete(code);
    return Promise.resolve();
  }
}

describe('Product use cases', () => {
  it('creates a product', async () => {
    const repository = new InMemoryProductRepository();
    const useCase = new CreateProductUseCase(repository);

    const response = await useCase.execute({
      code: 'FILTRO01',
      name: 'Filtro de ar',
      description: 'Filtro do sistema de admissao',
    });

    expect(response.code).toBe('FILTRO01');
    expect(response.name).toBe('Filtro de ar');
    expect(repository.products.size).toBe(1);
  });

  it('gets a product by code', async () => {
    const repository = new InMemoryProductRepository();
    await repository.create(
      Product.create({
        code: 'FILTRO01',
        name: 'Filtro de ar',
      }),
    );
    const useCase = new GetProductUseCase(repository);

    const response = await useCase.execute('FILTRO01');

    expect(response.code).toBe('FILTRO01');
    expect(response.name).toBe('Filtro de ar');
  });

  it('lists products', async () => {
    const repository = new InMemoryProductRepository();
    await repository.create(
      Product.create({
        code: 'FILTRO01',
        name: 'Filtro de ar',
      }),
    );
    await repository.create(
      Product.create({
        code: 'OLEO01',
        name: 'Oleo 5W30',
      }),
    );
    const useCase = new GetAllProductUseCase(repository);

    const response = await useCase.execute();

    expect(response).toHaveLength(2);
    expect(response.map((item) => item.code)).toEqual(['FILTRO01', 'OLEO01']);
  });

  it('updates a product', async () => {
    const repository = new InMemoryProductRepository();
    await repository.create(
      Product.create({
        code: 'FILTRO01',
        name: 'Filtro de ar',
      }),
    );
    const useCase = new UpdateProductUseCase(repository);

    const response = await useCase.execute('FILTRO01', {
      name: 'Filtro de ar condicionado',
    });

    expect(response.name).toBe('Filtro de ar condicionado');
  });

  it('deletes a product', async () => {
    const repository = new InMemoryProductRepository();
    await repository.create(
      Product.create({
        code: 'FILTRO01',
        name: 'Filtro de ar',
      }),
    );
    const useCase = new DeleteProductUseCase(repository);

    await useCase.execute('FILTRO01');

    expect(repository.products.has('FILTRO01')).toBe(false);
  });
});

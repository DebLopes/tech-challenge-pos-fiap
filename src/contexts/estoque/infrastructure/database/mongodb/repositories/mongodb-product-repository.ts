import { NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Product,
  type ProductProps,
} from '../../../../domain/entities/product';
import { ProductRepositoryInterface } from '../../../../domain/repositories/product.repository';
import { ProductModel } from '../models/product/product.model';

export class MongodbProductRepository implements ProductRepositoryInterface {
  constructor(
    @InjectModel(ProductModel.name)
    private readonly productModel: Model<ProductModel>,
  ) {}

  private toDomain(doc: ProductModel): Product {
    return Product.create(
      {
        code: doc.code,
        name: doc.name,
        description: doc.description,
      },
      doc._id,
    );
  }

  async create(data: Product): Promise<Product> {
    const created = await this.productModel.create({
      _id: data.id,
      code: data.code,
      name: data.name,
      description: data.description,
    });
    return this.toDomain(created);
  }

  async find(): Promise<Product[]> {
    const docs = await this.productModel.find({}, { __v: false });
    return docs.map((d) => this.toDomain(d));
  }

  async findByCodeOrNull(code: string): Promise<Product | null> {
    const doc = await this.productModel.findOne({ code });
    return doc ? this.toDomain(doc) : null;
  }

  async findByCode(code: string): Promise<Product> {
    const product = await this.productModel.findOne({ code });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.toDomain(product);
  }

  async updateByCode(
    code: string,
    dataUpdate: Partial<Pick<ProductProps, 'name' | 'description'>>,
  ): Promise<Product> {
    const updated = await this.productModel.findOneAndUpdate(
      { code },
      { $set: { ...dataUpdate, updatedAt: new Date() } },
      { returnDocument: 'after' },
    );

    if (!updated) {
      throw new NotFoundException('Product not found');
    }

    return this.toDomain(updated);
  }

  async remove(code: string): Promise<void> {
    await this.productModel.deleteOne({ code });
  }
}

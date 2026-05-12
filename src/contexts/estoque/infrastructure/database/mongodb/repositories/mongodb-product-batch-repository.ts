import { NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ProductBatch,
  type ProductBatchProps,
} from '../../../../domain/entities/product-batch';
import { ProductBatchRepositoryInterface } from '../../../../domain/repositories/product-batch.repository';
import { ProductBatchModel } from '../models/product-batch/product-batch.model';

export class MongodbProductBatchRepository implements ProductBatchRepositoryInterface {
  constructor(
    @InjectModel(ProductBatchModel.name)
    private readonly productBatchModel: Model<ProductBatchModel>,
  ) {}

  private toDomain(doc: ProductBatchModel): ProductBatch {
    return ProductBatch.restore(
      {
        productCode: doc.productCode,
        quantity: doc.quantity,
        costPrice: doc.costPrice,
        salePrice: doc.salePrice,
      },
      doc._id,
    );
  }

  async create(data: ProductBatch): Promise<ProductBatch> {
    const created = await this.productBatchModel.create({
      _id: data.id,
      productCode: data.productCode,
      quantity: data.quantity,
      costPrice: data.costPrice,
      salePrice: data.salePrice,
    });
    return this.toDomain(created);
  }

  async find(): Promise<ProductBatch[]> {
    const docs = await this.productBatchModel.find({}, { __v: false });
    return docs.map((d) => this.toDomain(d));
  }

  async findByCodeProduct(productCode: string): Promise<ProductBatch[]> {
    const product = await this.productBatchModel.find({ productCode });

    if (!product.length) {
      throw new NotFoundException('Product Batch not found');
    }

    return product.map((d) => this.toDomain(d));
  }

  async findAvailableByCode(productCode: string): Promise<ProductBatch[]> {
    const docs = await this.productBatchModel
      .find({ productCode, quantity: { $gt: 0 } })
      .sort({ createdAt: 1 });
    return docs.map((d) => this.toDomain(d));
  }

  async updateById(
    id: string,
    dataUpdate: Partial<ProductBatchProps>,
  ): Promise<ProductBatch> {
    const updated = await this.productBatchModel.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          ...dataUpdate,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' },
    );

    if (!updated) {
      throw new NotFoundException('ProductBatch not found');
    }

    return this.toDomain(updated);
  }

  async remove(id: string): Promise<void> {
    await this.productBatchModel.deleteOne({ _id: id });
  }
}

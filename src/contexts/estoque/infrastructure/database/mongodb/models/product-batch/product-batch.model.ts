import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';

@Schema({
  collection: 'product_batches',
  timestamps: true,
})
export class ProductBatchModel {
  @Prop({ type: String, default: () => randomUUID() })
  _id!: string;

  @Prop({
    type: String,
    ref: 'ProductModel',
    required: true,
    uppercase: true,
    trim: true,
  })
  productCode: string;

  @Prop({ type: Number, required: true, min: 0 })
  quantity: number;

  @Prop({ type: Number, required: true, min: 0 })
  costPrice: number;

  @Prop({ type: Number, required: true, min: 0 })
  salePrice: number;
}

export const ProductBatchSchema =
  SchemaFactory.createForClass(ProductBatchModel);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';

@Schema({
  collection: 'product',
  timestamps: true,
})
export class ProductModel {
  @Prop({ type: String, default: () => randomUUID() })
  _id!: string;

  @Prop({
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  })
  code: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String })
  description?: string;
}

export const ProductSchema = SchemaFactory.createForClass(ProductModel);

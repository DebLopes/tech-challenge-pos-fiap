import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';

@Schema({
  collection: 'catalog_service',
  timestamps: true,
})
export class CatalogServiceModel {
  @Prop({
    type: String,
    default: () => randomUUID(),
  })
  _id!: string;

  @Prop({ type: String, required: true, trim: true })
  name!: string;

  @Prop({ type: String, trim: true })
  description?: string;

  @Prop({ type: Number, required: true })
  basePrice!: number;

  @Prop({ type: Boolean, required: true, default: true })
  active!: boolean;

  @Prop({
    type: [
      {
        _id: false,
        productCode: {
          type: String,
          required: true,
          uppercase: true,
          trim: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
    default: [],
  })
  defaultParts!: { productCode: string; quantity: number }[];

  @Prop({ type: Date })
  createdAt?: Date;

  @Prop({ type: Date })
  updatedAt?: Date;

  get id(): string {
    return this._id;
  }
}

export const CatalogServiceSchema =
  SchemaFactory.createForClass(CatalogServiceModel);

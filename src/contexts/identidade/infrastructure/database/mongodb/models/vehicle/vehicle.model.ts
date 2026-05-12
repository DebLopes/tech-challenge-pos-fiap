import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';

@Schema({
  collection: 'vehicle',
  timestamps: true,
})
export class VehicleModel {
  @Prop({
    type: String,
    default: () => randomUUID(),
  })
  _id!: string;

  @Prop({
    type: String,
    required: true,
    immutable: true,
    unique: true,
  })
  plate: string;

  @Prop({
    type: String,
    required: true,
  })
  model: string;

  @Prop({
    type: String,
    required: true,
  })
  brand: string;

  @Prop({
    type: Number,
    required: true,
  })
  year: number;

  @Prop({
    type: Date,
  })
  createdAt: Date;

  @Prop({
    type: Date,
  })
  updatedAt: Date;

  get id(): string {
    return this._id;
  }
}

export const VehicleSchema = SchemaFactory.createForClass(VehicleModel);

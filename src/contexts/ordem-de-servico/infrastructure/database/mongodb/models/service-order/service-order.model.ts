import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { ServiceOrderStatus } from '../../../../../domain/entities/service-order-status';

@Schema({
  collection: 'service_order',
  timestamps: true,
})
export class ServiceOrderModel {
  @Prop({ type: String, default: () => randomUUID() })
  _id!: string;

  @Prop({
    type: String,
    enum: Object.values(ServiceOrderStatus),
    required: true,
    default: ServiceOrderStatus.RECEIVED,
  })
  status!: ServiceOrderStatus;

  @Prop({
    type: {
      _id: false,
      id: { type: String, required: true },
      document: { type: String, required: true },
      name: { type: String, required: true },
    },
    required: true,
  })
  client!: { id: string; document: string; name: string };

  @Prop({
    type: {
      _id: false,
      id: { type: String, required: true },
      plate: { type: String, required: true },
      brand: { type: String, required: true },
      model: { type: String, required: true },
      year: { type: Number, required: true },
    },
    required: true,
  })
  vehicle!: {
    id: string;
    plate: string;
    brand: string;
    model: string;
    year: number;
  };

  @Prop({ type: String })
  requestedServicesDescription?: string;

  @Prop({ type: String })
  diagnosis?: string;

  @Prop({
    type: [
      {
        _id: false,
        id: { type: String, required: true },
        catalogServiceId: { type: String, required: true },
        name: { type: String, required: true },
        unitPrice: { type: Number, required: true },
        quantity: { type: Number, required: true },
        defaultParts: [
          {
            _id: false,
            productCode: { type: String, required: true },
            name: { type: String, required: true },
            quantity: { type: Number, required: true },
          },
        ],
      },
    ],
    default: [],
  })
  serviceLines!: {
    id: string;
    catalogServiceId: string;
    name: string;
    unitPrice: number;
    quantity: number;
    defaultParts: { productCode: string; name: string; quantity: number }[];
  }[];

  @Prop({
    type: [
      {
        _id: false,
        id: { type: String, required: true },
        productCode: { type: String, required: true },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    default: [],
  })
  partLines!: {
    id: string;
    productCode: string;
    name: string;
    quantity: number;
  }[];

  @Prop({
    type: {
      _id: false,
      items: [
        {
          _id: false,
          type: { type: String, required: true },
          referenceId: { type: String, required: true },
          description: { type: String, required: true },
          quantity: { type: Number, required: true },
          unitPrice: { type: Number, required: true },
          total: { type: Number, required: true },
        },
      ],
      servicesTotal: { type: Number, required: true },
      partsTotal: { type: Number, required: true },
      total: { type: Number, required: true },
      approved: { type: Boolean, required: true },
      approvedAt: { type: Date },
    },
  })
  budget?: {
    items: {
      type: 'SERVICE' | 'PART';
      referenceId: string;
      description: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }[];
    servicesTotal: number;
    partsTotal: number;
    total: number;
    approved: boolean;
    approvedAt?: Date;
  };

  @Prop({
    type: [
      {
        _id: false,
        from: { type: String },
        to: { type: String, required: true },
        at: { type: Date, required: true },
      },
    ],
    default: [],
  })
  statusHistory!: {
    from: ServiceOrderStatus | null;
    to: ServiceOrderStatus;
    at: Date;
  }[];

  @Prop({ type: Date })
  startedAt?: Date;

  @Prop({ type: Date })
  finishedAt?: Date;

  @Prop({ type: Date })
  deliveredAt?: Date;

  @Prop({ type: String })
  cancellationReason?: string;

  @Prop({ type: Date })
  createdAt?: Date;

  @Prop({ type: Date })
  updatedAt?: Date;
}

export const ServiceOrderSchema =
  SchemaFactory.createForClass(ServiceOrderModel);

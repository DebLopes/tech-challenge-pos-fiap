import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ServiceOrder } from '../../../../domain/entities/service-order';
import { DocumentVO } from '../../../../../identidade/domain/value-objects/document.vo';
import { PlateVO } from '../../../../../identidade/domain/value-objects/plate.vo';
import { ServiceOrderStatus } from '../../../../domain/entities/service-order-status';
import { ServiceOrderRepositoryInterface } from '../../../../domain/repositories/service-order.repository';
import { ServiceOrderModel } from '../models/service-order/service-order.model';
import { hydrateServiceOrderDoc } from './service-order.mapper';

export class MongodbServiceOrderRepository implements ServiceOrderRepositoryInterface {
  constructor(
    @InjectModel(ServiceOrderModel.name)
    private readonly serviceOrderModel: Model<ServiceOrderModel>,
  ) {}

  private toPersistence(order: ServiceOrder) {
    return {
      _id: order.id,
      status: order.status,
      client: {
        id: order.clientId,
        document: order.clientDocument,
        name: order.clientName,
      },
      vehicle: {
        id: order.vehicleId,
        plate: order.vehiclePlate,
        brand: order.vehicleBrand,
        model: order.vehicleModel,
        year: order.vehicleYear,
      },
      requestedServicesDescription: order.requestedServicesDescription,
      diagnosis: order.diagnosis,
      serviceLines: order.serviceLines,
      partLines: order.partLines,
      budget: order.budget,
      statusHistory: order.statusHistory,
      startedAt: order.startedAt,
      finishedAt: order.finishedAt,
      deliveredAt: order.deliveredAt,
      cancellationReason: order.cancellationReason,
    };
  }

  async create(order: ServiceOrder): Promise<ServiceOrder> {
    const doc = await this.serviceOrderModel.create(this.toPersistence(order));
    return hydrateServiceOrderDoc(doc);
  }

  async find(): Promise<ServiceOrder[]> {
    const rows = await this.serviceOrderModel
      .find(
        {
          status: {
            $nin: [
              ServiceOrderStatus.DELIVERED,
              ServiceOrderStatus.FINISHED,
              ServiceOrderStatus.CANCELLED,
            ],
          },
        },
        { __v: false },
      )
      .sort({ createdAt: 1 })
      .lean()
      .exec();
    return rows.map((r) => hydrateServiceOrderDoc(r));
  }

  async findById(id: string): Promise<ServiceOrder | null> {
    const raw = await this.serviceOrderModel.findById(id).lean().exec();
    return raw ? hydrateServiceOrderDoc(raw) : null;
  }

  async findOpenByDocument(
    document: string,
    plate?: string,
  ): Promise<ServiceOrder[]> {
    const docKey = DocumentVO.parse(document).value;
    const docMatch = {
      $or: [{ 'client.document': docKey }, { clientDocument: docKey }],
    };
    const statusMatch = {
      status: {
        $nin: [ServiceOrderStatus.DELIVERED, ServiceOrderStatus.CANCELLED],
      },
    };
    const filter = plate
      ? {
          $and: [
            docMatch,
            {
              $or: [
                { 'vehicle.plate': PlateVO.parse(plate).value },
                { vehiclePlate: PlateVO.parse(plate).value },
              ],
            },
            statusMatch,
          ],
        }
      : { ...docMatch, ...statusMatch };
    const rows = await this.serviceOrderModel
      .find(filter)
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    return rows.map((r) => hydrateServiceOrderDoc(r));
  }

  async findFinished(): Promise<ServiceOrder[]> {
    const rows = await this.serviceOrderModel
      .find({
        startedAt: { $ne: null },
        finishedAt: { $ne: null },
      })
      .lean()
      .exec();
    return rows.map((r) => hydrateServiceOrderDoc(r));
  }

  async save(order: ServiceOrder): Promise<ServiceOrder | null> {
    const data = this.toPersistence(order);
    const raw = await this.serviceOrderModel
      .findByIdAndUpdate(
        order.id,
        {
          $set: { ...data, updatedAt: new Date() },
          $unset: {
            clientId: '',
            clientDocument: '',
            clientName: '',
            vehicleId: '',
            vehiclePlate: '',
            vehicleBrand: '',
            vehicleModel: '',
            vehicleYear: '',
          },
        },
        { returnDocument: 'after' },
      )
      .lean()
      .exec();
    return raw ? hydrateServiceOrderDoc(raw) : null;
  }
}

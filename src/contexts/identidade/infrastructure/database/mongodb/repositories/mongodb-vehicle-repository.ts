import { EntityNotFoundError } from '../../../../../shared/domain/errors';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vehicle } from '../../../../domain/entities/vehicle';
import { PlateVO } from '../../../../../shared/domain/value-objects/plate.vo';
import { VehicleRepositoryInterface } from '../../../../domain/repositories/vehicle.repository';
import { VehicleModel } from '../models/vehicle/vehicle.model';

export class MongodbVehicleRepository implements VehicleRepositoryInterface {
  constructor(
    @InjectModel(VehicleModel.name)
    private readonly vehicleModel: Model<VehicleModel>,
  ) {}

  private toDomain(doc: VehicleModel): Vehicle {
    return Vehicle.create(
      {
        plate: doc.plate,
        model: doc.model,
        brand: doc.brand,
        year: doc.year,
      },
      doc._id,
    );
  }

  async create(data: Vehicle): Promise<Vehicle> {
    const created = await this.vehicleModel.create({
      _id: data.id,
      plate: data.plate,
      model: data.model,
      brand: data.brand,
      year: data.year,
    });
    return this.toDomain(created);
  }

  async find(): Promise<Vehicle[]> {
    const docs = await this.vehicleModel
      .find({}, { __v: false })
      .sort({ createdAt: -1 })
      .exec();
    return docs.map((d) => this.toDomain(d));
  }

  async findById(id: string): Promise<Vehicle | null> {
    const doc = await this.vehicleModel.findById(id);
    return doc ? this.toDomain(doc) : null;
  }

  async findByPlate(plate: string): Promise<Vehicle> {
    const plateKey = PlateVO.parse(plate).value;
    const veh = await this.vehicleModel.findOne({ plate: plateKey });

    if (!veh) {
      throw new EntityNotFoundError('Vehicle not found');
    }

    return this.toDomain(veh);
  }

  async updateByPlate(
    plate: string,
    dataUpdate: Partial<{ model: string; brand: string; year: number }>,
  ): Promise<Vehicle> {
    const plateKey = PlateVO.parse(plate).value;
    const updated = await this.vehicleModel.findOneAndUpdate(
      { plate: plateKey },
      { $set: { ...dataUpdate, updatedAt: new Date() } },
      { returnDocument: 'after' },
    );

    if (!updated) {
      throw new EntityNotFoundError('Vehicle not found');
    }

    return this.toDomain(updated);
  }

  async remove(plate: string): Promise<void> {
    const plateKey = PlateVO.parse(plate).value;
    await this.vehicleModel.deleteOne({ plate: plateKey });
  }
}

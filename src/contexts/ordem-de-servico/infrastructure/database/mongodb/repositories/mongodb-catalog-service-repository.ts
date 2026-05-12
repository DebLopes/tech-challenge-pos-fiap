import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CatalogService } from '../../../../domain/entities/catalog-service';
import type { CatalogServiceUpdateInput } from '../../../../domain/repositories/catalog-service.repository';
import { CatalogServiceRepositoryInterface } from '../../../../domain/repositories/catalog-service.repository';
import { CatalogServiceModel } from '../models/catalog-service/catalog-service.model';

export class MongodbCatalogServiceRepository implements CatalogServiceRepositoryInterface {
  constructor(
    @InjectModel(CatalogServiceModel.name)
    private readonly catalogServiceModel: Model<CatalogServiceModel>,
  ) {}

  private toDomain(doc: CatalogServiceModel): CatalogService {
    return CatalogService.create(
      {
        name: doc.name,
        description: doc.description,
        basePrice: doc.basePrice,
        active: doc.active,
        defaultParts: doc.defaultParts ?? [],
      },
      doc._id,
    );
  }

  async create(data: CatalogService): Promise<CatalogService> {
    const created = await this.catalogServiceModel.create({
      _id: data.id,
      name: data.name,
      description: data.description,
      basePrice: data.basePrice,
      active: data.active,
      defaultParts: data.defaultParts,
    });
    return this.toDomain(created);
  }

  async find(): Promise<CatalogService[]> {
    const docs = await this.catalogServiceModel.find({}, { __v: false });
    return docs.map((d) => this.toDomain(d));
  }

  async findById(id: string): Promise<CatalogService | null> {
    const doc = await this.catalogServiceModel.findById(id);
    return doc ? this.toDomain(doc) : null;
  }

  async updateById(
    id: string,
    data: CatalogServiceUpdateInput,
  ): Promise<CatalogService | null> {
    const payload = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined),
    ) as CatalogServiceUpdateInput;
    const updated = await this.catalogServiceModel.findByIdAndUpdate(
      id,
      { $set: { ...payload, updatedAt: new Date() } },
      { returnDocument: 'after' },
    );
    return updated ? this.toDomain(updated) : null;
  }

  async remove(id: string): Promise<void> {
    await this.catalogServiceModel.deleteOne({ _id: id });
  }
}

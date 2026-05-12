import { NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Client } from '../../../../domain/entities/client';
import { DocumentVO } from '../../../../domain/value-objects/document.vo';
import { EmailVO } from '../../../../domain/value-objects/email.vo';
import { ClientRepositoryInterface } from '../../../../domain/repositories/client.repository';
import { ClientModel } from '../models/client/client.model';

export class MongodbClientRepository implements ClientRepositoryInterface {
  constructor(
    @InjectModel(ClientModel.name)
    private readonly clientModel: Model<ClientModel>,
  ) {}

  private toDomain(doc: ClientModel): Client {
    return Client.create(
      {
        name: doc.name,
        email: doc.email,
        document: doc.document,
      },
      doc._id,
    );
  }

  async create(data: Client): Promise<Client> {
    const created = await this.clientModel.create({
      _id: data.id,
      name: data.name,
      email: data.email,
      document: data.document,
    });
    return this.toDomain(created);
  }

  async find(): Promise<Client[]> {
    const docs = await this.clientModel.find({}, { __v: false });
    return docs.map((d) => this.toDomain(d));
  }

  async findById(id: string): Promise<Client | null> {
    const doc = await this.clientModel.findById(id);
    return doc ? this.toDomain(doc) : null;
  }

  async findByDocument(document: string): Promise<Client> {
    const docKey = DocumentVO.parse(document).value;
    const client = await this.clientModel.findOne({ document: docKey });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return this.toDomain(client);
  }

  async updateByDocument(
    document: string,
    dataUpdate: Partial<{ name: string; email: string }>,
  ): Promise<Client> {
    const docKey = DocumentVO.parse(document).value;
    const payload: { name?: string; email?: string } = {};
    if (dataUpdate.name !== undefined) payload.name = dataUpdate.name;
    if (dataUpdate.email !== undefined) {
      payload.email = EmailVO.parse(dataUpdate.email).value;
    }
    const updated = await this.clientModel.findOneAndUpdate(
      { document: docKey },
      { $set: { ...payload, updatedAt: new Date() } },
      { returnDocument: 'after' },
    );

    if (!updated) {
      throw new NotFoundException('Client not found');
    }

    return this.toDomain(updated);
  }

  async remove(document: string): Promise<void> {
    const docKey = DocumentVO.parse(document).value;
    await this.clientModel.deleteOne({ document: docKey });
  }
}

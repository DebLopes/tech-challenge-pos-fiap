import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../../../domain/entities/user';
import type { UserRepositoryInterface } from '../../../../domain/repositories/user.repository';
import { UserModel } from '../models/user/user.model';

export class MongodbUserRepository implements UserRepositoryInterface {
  constructor(
    @InjectModel(UserModel.name)
    private readonly userModel: Model<UserModel>,
  ) {}

  private toDomain(doc: UserModel): User {
    return User.create(
      {
        name: doc.name,
        email: doc.email,
        passwordHash: doc.passwordHash,
        role: doc.role,
        active: doc.active,
      },
      doc._id,
    );
  }

  async create(data: User): Promise<User> {
    const created = await this.userModel.create({
      _id: data.id,
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash: data.passwordHash,
      role: data.role,
      active: data.active,
    });
    return this.toDomain(created);
  }

  async findByEmail(email: string): Promise<User | null> {
    const doc = await this.userModel.findOne({ email: email.toLowerCase() });
    return doc ? this.toDomain(doc) : null;
  }

  async findById(id: string): Promise<User | null> {
    const doc = await this.userModel.findById(id);
    return doc ? this.toDomain(doc) : null;
  }
}

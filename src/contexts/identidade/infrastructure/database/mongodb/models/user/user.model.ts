import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { UserRole } from '../../../../../domain/entities/user-role';

@Schema({
  collection: 'user',
  timestamps: true,
})
export class UserModel {
  @Prop({
    type: String,
    default: () => randomUUID(),
  })
  _id!: string;

  @Prop({ type: String, required: true })
  name!: string;

  @Prop({
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  email!: string;

  @Prop({ type: String, required: true })
  passwordHash!: string;

  @Prop({
    type: String,
    required: true,
    enum: UserRole,
  })
  role!: UserRole;

  @Prop({ type: Boolean, default: true })
  active!: boolean;

  @Prop({ type: Date })
  createdAt?: Date;

  @Prop({ type: Date })
  updatedAt?: Date;

  get id(): string {
    return this._id;
  }
}

export const UserSchema = SchemaFactory.createForClass(UserModel);

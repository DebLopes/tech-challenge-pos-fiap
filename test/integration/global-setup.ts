import mongoose from 'mongoose';
import { resolveIntegrationMongoUrl } from './helpers/mongo-url';

export default async function globalSetup(): Promise<void> {
  const uri = resolveIntegrationMongoUrl();
  await mongoose.connect(uri);
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
}

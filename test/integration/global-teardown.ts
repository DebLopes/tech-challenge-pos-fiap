import mongoose from 'mongoose';
import { resolveIntegrationMongoUrl } from './helpers/mongo-url';

export default async function globalTeardown(): Promise<void> {
  const uri = resolveIntegrationMongoUrl();
  try {
    await mongoose.connect(uri);
    await mongoose.connection.dropDatabase();
  } finally {
    await mongoose.disconnect().catch(() => undefined);
  }
}

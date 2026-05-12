export const DEFAULT_INTEGRATION_MONGO_URL =
  'mongodb://127.0.0.1:27017/tech-challenge-integration';

export function resolveIntegrationMongoUrl(): string {
  if (process.env.MONGO_URL_INTEGRATION?.trim()) {
    return process.env.MONGO_URL_INTEGRATION.trim();
  }
  if (process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true') {
    return process.env.MONGO_URL?.trim() || DEFAULT_INTEGRATION_MONGO_URL;
  }
  return DEFAULT_INTEGRATION_MONGO_URL;
}

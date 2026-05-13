import {
  INTEGRATION_ADMIN_EMAIL,
  INTEGRATION_ADMIN_NAME,
  INTEGRATION_ADMIN_PASSWORD,
} from '../dev-credentials.fixture';

export const integrationAdminCredentials = {
  email: INTEGRATION_ADMIN_EMAIL,
  password: INTEGRATION_ADMIN_PASSWORD,
  name: INTEGRATION_ADMIN_NAME,
} as const;

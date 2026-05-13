/**
 * Credenciais e JWT fixos só para testes de integração (Mongo é limpo no globalSetup).
 * Não usar em produção.
 */
export const INTEGRATION_ADMIN_EMAIL = 'integration-admin@test.dev';
export const INTEGRATION_ADMIN_PASSWORD = 'integrationPass1';
export const INTEGRATION_ADMIN_NAME = 'Integration Admin';

/** Mesma password para utilizadores extra criados nos testes (estoquista, atendente). */
export const INTEGRATION_USER_PASSWORD = INTEGRATION_ADMIN_PASSWORD;

export const INTEGRATION_JWT_SECRET =
  'integration-test-secret-at-least-32-characters-long';

const domainCriticalGlobs = [
  'src/contexts/ordem-de-servico/domain/entities/service-order.ts',
  'src/contexts/ordem-de-servico/domain/entities/service-order-status.ts',
  'src/contexts/identidade/domain/value-objects/document.vo.ts',
  'src/contexts/identidade/domain/value-objects/email.vo.ts',
  'src/contexts/identidade/domain/value-objects/plate.vo.ts',
  'src/contexts/shared/domain/value-objects/money.vo.ts',
  'src/contexts/estoque/domain/services/budget-pricing.ts',
];

module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: 'src/.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: domainCriticalGlobs,
  coveragePathIgnorePatterns: ['\\.spec\\.ts$'],
  coverageDirectory: 'coverage',
  testEnvironment: 'node',
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 78,
      functions: 80,
      lines: 80,
    },
  },
};

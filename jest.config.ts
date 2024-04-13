import type { Config } from 'jest';

const jestConfig: Config = {
  rootDir: '.',
  testEnvironment: 'node',
  transform: { '^.+\\.ts?$': 'ts-jest' },
  globals: {
    'ts-jest': {
      diagnostics: false,
    },
  },
  moduleFileExtensions: ['js', 'ts', 'd.ts'],
  testRegex: '.*\\.test\\.ts$',
  modulePathIgnorePatterns: ['<rootDir>/__tests__/helpers/'],
  moduleNameMapper: {
    '@/(.*)': '<rootDir>/lib/$1',
  },
};

export default jestConfig;

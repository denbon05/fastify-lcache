import type { JestConfigWithTsJest } from 'ts-jest';

const jestConfig: JestConfigWithTsJest = {
  rootDir: '.',
  testEnvironment: 'node',
  transform: { '^.+\\.ts?$': 'ts-jest' },
  moduleFileExtensions: ['js', 'ts', 'd.ts'],
  testRegex: '.*\\.test\\.ts$',
  modulePathIgnorePatterns: ['<rootDir>/__tests__/helpers/'],
  moduleNameMapper: {
    '@/(.*)': '<rootDir>/lib/$1',
  },
};

export default jestConfig;

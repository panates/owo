module.exports = {
  testEnvironment: 'node',
  'verbose': true,
  'forceExit': true,
  coveragePathIgnorePatterns: [
    '<rootDir>/build/',
    '<rootDir>/dist/',
    '/node_modules/',
    '_support'
  ],
  coverageReporters: ['lcov', 'text'],
  coverageDirectory: "<rootDir>/coverage/",
  transform: {
    '^.+.ts?$': ['ts-jest', {
      'tsconfig': '<rootDir>/test/tsconfig.json'
    }]
  },
  moduleNameMapper: {
    '^@opra/optionals$': ['<rootDir>/../optionals/cjs'],
    '^@opra/(.*)$': ['<rootDir>/../$1/src'],
    '^(\\..+)\\.js$': '$1'
  }

};

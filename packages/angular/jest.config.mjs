import {readFile} from 'fs/promises';

const packageJson = JSON.parse(await readFile(new URL('./package.json', import.meta.url)));

export default {
  displayName: packageJson.name,

  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/test/_support/setup-jest.ts'],
  globalSetup: 'jest-preset-angular/global-setup',

  moduleNameMapper: {
    '^#/(.*)': ['./$1'],
    '^@opra/client$': ['<rootDir>/../node-client/src'],
    '^@opra/([^/]*)/test$': ['<rootDir>/../$1/test'],
    '^@opra/([^/]*)/test(?:/(.+))$': ['<rootDir>/../$1/test/$2'],
    '^@opra/([^/]*)(?:/(.+))$': ['<rootDir>/../$1/src/$2'],
    '^@opra/([^/]*)$': ['<rootDir>/../$1/src'],
    '^(\\.{1,2}/.*)\\.js$': '$1'

  }
};

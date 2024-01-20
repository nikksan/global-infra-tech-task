'use strict';

const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig');

module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
  ],
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRunner: 'jest-circus/runner',
  silent: false,
  forceExit: true,
  verbose: true,
  testMatch: [
    '<rootDir>/tests/**/?(*.)+(test).ts',
  ],
  watchPathIgnorePatterns: ['<rootDir>/node_modules/'],
  modulePathIgnorePatterns: ['node_modules'],
  moduleFileExtensions: ['ts', 'js'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: `<rootDir>` }),
};

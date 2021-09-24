/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
module.exports = {
  testRegex: '(\\/spec|\\/src)\\/.*(_spec|\\.test)\\.(j|t)sx?$',
  testPathIgnorePatterns: ['.git/.*', 'node_modules/.*'],
  transformIgnorePatterns: ['node_modules/.*'],
  moduleNameMapper: {
    '\\.(css|less)$': '<rootDir>/spec/__mocks__/styleMock.js',
    '\\.(gif|ttf|eot)$': '<rootDir>/spec/__mocks__/fileMock.js',
    '\\.svg$': '<rootDir>/spec/__mocks__/svgrMock.js',
    '^src/(.*)$': '<rootDir>/src/$1',
    '^spec/(.*)$': '<rootDir>/spec/$1',
    '^~~config/(.*)$': '<rootDir>/src/config/$1',
    '^~~config': '<rootDir>/src/config/index.js',
    '^~~apis/(.*)$': '<rootDir>/src/apis/$1',
    '^~~hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^~~utils/(.*)$': '<rootDir>/src/utils/$1',
    '^~~constants/(.*)$': '<rootDir>/src/constants/$1',
    '^~~constants': '<rootDir>/src/constants/index.js',
    '^~~components/(.*)$': '<rootDir>/src/components/$1',
    '^~~store/(.*)$': '<rootDir>/src/store/$1',
    'monaco-editor': '<rootDir>/node_modules/@baic/sql-editor/lib/index.js',
  },
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/spec/helpers/setup.ts'],
  testURL: 'http://localhost',
  coveragePathIgnorePatterns: [
    '<rootDir>/src/wisDOM/components/Explore',
    '<rootDir>/src/wisDOM/components/SqlDiagram/actions',
    '<rootDir>/src/wisDOM/components/SqlKedro/components/Menu/Menu.js',
    '<rootDir>/src/wisDOM/components/WorkflowKedro/components/Menu/Menu.js',
    '<rootDir>/src/wisDOM/components/SqlKedro/components/Menu/MenuItem/Transform/Customize.js',
    '<rootDir>/src/wisDOM/components/SqlEditor',
    '<rootDir>/src/wisDOM/components/WorkflowKedro/components/Menu/MenuItem/PowerBi/Sub2Poperties.js',
    '<rootDir>/src/wisDOM/components/WorkflowKedro/components/Menu/MenuItem/PowerBi/Poperties.js',
    '<rootDir>/src/wisDOM/components/SearchData/SearchData.js',
    '<rootDir>/src/wisDOM/components/WorkflowKedro/components/Menu/MenuItem/Schedule/Poperties.js',
  ],
  collectCoverageFrom: ['src/wisDOM/**/*.{js,jsx,ts,tsx}'],
  coverageDirectory: '<rootDir>/coverage/',
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  globals: {
    'ts-jest': {
      babelConfig: true,
      diagnostics: {
        warnOnly: true,
      },
      isolatedModules: true,
    },
  },
};

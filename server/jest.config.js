
module.exports = {
    testEnvironment: 'node',
    setupFilesAfterEnv: ['./jest.setup.js'],
    collectCoverage: true,
    collectCoverageFrom: [
      'routes/**/*.js',
      '!**/node_modules/**',
      '!**/tests/**'
    ],
    coverageDirectory: './coverage'
  };
  
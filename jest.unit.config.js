module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'tsx', 'js'],
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest'
    },
    globals: {
        'ts-jest': {
            tsConfig: 'tsconfig.json'
        }
    },
    testMatch: [
        '**/tests/*.spec.+(ts|tsx|js)',
        '**/tests/**/*.spec.+(ts|tsx|js)'
    ],
    testPathIgnorePatterns: [
        '/node_modules/',
        '/dist/',
        '/src/test/'
    ],
    collectCoverage: true,
    collectCoverageFrom: [
        '**/src/**/*.ts',
        '!**/src/**/*.d.ts',
        '!**/src/index.ts',
        '!**/src/newrelic.ts',
        '!**/src/common/*.ts',
        '!**/src/domains/*.ts',
        '!**/src/resources/backpressure/*.ts',
        '!**/src/resources/config/*.ts',
        '!**/src/resources/handler/*.ts',
        '!**/src/resources/validator/GlobalValidate.ts',
        '!**/src/tests/**/*.ts'
    ],
    coverageDirectory: './coverage-unit',
    reporters: [
        'default',
        ['./node_modules/jest-html-reporter', {
            pageTitle: 'UnitTest Report',
            outputPath: './coverage-unit/report.html',
            sort: 'titleAsc'
        }]
    ],
    setupFilesAfterEnv: ['./jest.setup.js'],
    modulePathIgnorePatterns: ['.*__mocks__.*']
};

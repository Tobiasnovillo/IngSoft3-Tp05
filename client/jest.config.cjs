module.exports = {
    transform: {
        '^.+\\.[tj]sx?$': 'babel-jest'
    },
    testEnvironment: 'jsdom',
    moduleNameMapper: {
        '\\.(css|less|scss)$': 'identity-obj-proxy'
    },
    setupFilesAfterEnv: ['@testing-library/jest-dom'],
    extensionsToTreatAsEsm: ['.jsx'], // 👈 solo .jsx, no .js
    transformIgnorePatterns: ['/node_modules/']
};

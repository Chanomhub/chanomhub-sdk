import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['**/*.{test,spec}.{ts,tsx}'],
        setupFiles: ['./__tests__/setup.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html', 'lcov'],
            include: ['index.ts', 'client.ts', 'config.ts', 'repositories/**/*.ts', 'utils/**/*.ts', 'errors/**/*.ts', 'transforms/**/*.ts'],
            exclude: ['**/*.test.ts', '**/*.spec.ts', '**/node_modules/**', '**/dist/**', 'types/**/*.ts', 'repositories/index.ts', 'utils/index.ts'],
            thresholds: {
                statements: 79,
                branches: 70,
                functions: 80,
                lines: 80,
            },
        },
    },
});

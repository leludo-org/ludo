import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'happy-dom',
        include: ['test/**/*.test.js'],
        globals: false,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
            include: ['scripts/**/*.js', 'components/**/*.js'],
            exclude: ['**/index.js'],
        },
    },
});

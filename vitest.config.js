import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    include: ['tests/**/*.test.js', 'js/**/*.test.js'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'tests/setup.js',
        'ARCHIVE/**',  // Exclude archived files
        '**/test-*.js'  // Exclude test files
      ],
    },
  },
  resolve: {
    alias: {
      '@core': resolve(__dirname, './js/core'),
      '@components': resolve(__dirname, './js/components'),
      '@services': resolve(__dirname, './js/services'),
      '@utils': resolve(__dirname, './js/utils'),
      '@ui': resolve(__dirname, './js/ui')
    }
  }
});

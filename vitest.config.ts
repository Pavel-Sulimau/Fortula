import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/tests/**/*.test.ts'],
    exclude: ['e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: [
        'src/utils/random.ts',
        'src/utils/entries.ts',
        'src/utils/statistics.ts',
        'src/utils/storage.ts',
        'src/reducer/wheelReducer.ts',
      ],
    },
  },
});

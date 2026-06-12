import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: [
        'src/utils/random.ts',
        'src/utils/entries.ts',
        'src/utils/storage.ts',
        'src/reducer/wheelReducer.ts',
      ],
    },
  },
});

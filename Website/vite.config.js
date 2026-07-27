import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    exclude: ['**/node_modules/**', 'tests/e2e/**'],
    setupFiles: './src/test/setup.js',
    css: true,
  },
});

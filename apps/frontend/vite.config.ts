import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@pirate-dice/constants': path.resolve(__dirname, '../../libs/constants/src/index.ts'),
      '@pirate-dice/entities': path.resolve(__dirname, '../../libs/entities/src/index.ts'),
      '@pirate-dice/types': path.resolve(__dirname, '../../libs/types/src/index.ts'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:4000',
        ws: true,
      },
    },
  },
});

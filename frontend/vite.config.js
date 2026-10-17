import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/auth': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/skin-profile': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/consultations': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
});

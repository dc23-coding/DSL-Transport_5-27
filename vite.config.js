import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    cors: true,
    port: 5175,
    historyApiFallback: true, // SPA fallback (mainly for local dev)
    hmr: {
      protocol: 'ws',
      host: 'localhost',
    },
  },
  resolve: {
    extensions: ['.jsx', '.js', '.tsx', '.ts', '.json'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});

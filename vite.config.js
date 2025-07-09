import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1500, // Increased from default 500kb
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Custom chunk splitting strategy
          if (id.includes('node_modules')) {
            if (id.includes('react')) {
              return 'vendor-react';
            }
            if (id.includes('supabase')) {
              return 'vendor-supabase';
            }
            if (id.includes('html2canvas')) {
              return 'vendor-html2canvas';
            }
            return 'vendor'; // Other dependencies
          }
        }
      }
    }
  },
  server: {
    cors: true,
    port: 5175,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
  }
});
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@supabase/supabase-js')) {
              return 'supabase';
            }
            if (id.includes('react')) {
              return 'react';
            }
            if (id.includes('html2canvas')) {
              return 'html2canvas';
            }
            // Add more as needed
            return 'vendor'; // everything else from node_modules
          }
        }
      }
    },
    sourcemap: process.env.NODE_ENV !== 'production',
  },
  server: {
    port: 5175,
    cors: true,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
    },
  },
  preview: {
    port: 5175,
    cors: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
  },
  base: '/',
});

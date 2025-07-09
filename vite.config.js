import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  // Base public path (critical for Vercel)
  base: '/',
  
  // Plugins configuration
  plugins: [
    react({
      jsxRuntime: 'classic', // Fixes React context issues
      babel: {
        plugins: ['@babel/plugin-transform-react-jsx']
      }
    }),
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true
    })
  ],

  // Build configuration
  build: {
    outDir: 'dist', // Explicit output directory
    emptyOutDir: true, // Clean before building
    chunkSizeWarningLimit: 1500, // Increased from default 500kb
    sourcemap: process.env.NODE_ENV !== 'production', // Sourcemaps in dev only
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Enhanced chunk splitting strategy
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            if (id.includes('html2canvas')) {
              return 'vendor-html2canvas';
            }
            if (id.includes('lodash') || id.includes('date-fns')) {
              return 'vendor-utils';
            }
            return 'vendor'; // Other dependencies
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    }
  },

  // Development server configuration
  server: {
    cors: true,
    port: 5175,
    strictPort: true, // Exit if port is in use
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5175
    },
    watch: {
      usePolling: true // Useful for Docker/WSL2
    }
  },

  // Preview server configuration
  preview: {
    port: 5175,
    cors: true,
    strictPort: true
  },

  // Module resolution
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '~': path.resolve(__dirname, './public')
    },
    extensions: [
      '.js',
      '.jsx',
      '.ts',
      '.tsx',
      '.json',
      '.mjs'
    ]
  },

  // CSS configuration
  css: {
    modules: {
      localsConvention: 'camelCase'
    },
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    }
  }
});
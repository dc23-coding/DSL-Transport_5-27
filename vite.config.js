// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
    // Optional: bundle visualizer (won’t open automatically on Vercel)
    visualizer({
      open: false,
      filename: 'dist/stats.html',
      gzipSize: true,
    }),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  css: {
    postcss: {
      plugins: [tailwindcss(), autoprefixer()],
    },
  },

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    cssCodeSplit: true,
    sourcemap: false,
    minify: 'terser',
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        // ✅ Keep vendor chunking only — no per-page chunks
        manualChunks(id) {
          if (id.includes('node_modules/react')) return 'vendor-react'
          if (id.includes('node_modules/react-router-dom')) return 'vendor-router'
          if (id.includes('node_modules/framer-motion')) return 'vendor-framer-motion'
          if (id.includes('node_modules/@supabase')) return 'vendor-supabase'
          if (id.includes('node_modules/@radix-ui')) return 'vendor-radix'
          if (id.includes('node_modules/lucide-react')) return 'vendor-lucide'
          if (id.includes('node_modules/recharts')) return 'vendor-recharts'
          if (id.includes('node_modules/html2canvas')) return 'vendor-html2canvas'
          if (id.includes('node_modules/jspdf')) return 'vendor-jspdf'
        },

        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },

  // ✅ Local preview settings
  preview: {
    port: 4173,
    strictPort: true,
  },
})

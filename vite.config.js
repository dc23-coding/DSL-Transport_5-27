import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import path from 'path'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

// 🚀 Production-ready Vite config for React + Tailwind + Vercel static hosting
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
    visualizer({
      open: false, // disable auto-open on Vercel builds
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
    }),
  ],

  // 🧭 Fix 1: use relative base so assets load correctly on static hosts (Vercel, S3, etc.)
  base: './',

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
    cssCodeSplit: true,
    sourcemap: false,
    minify: 'terser',
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        manualChunks(id) {
          // ---- Vendor chunks ----
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/'))
            return 'vendor-react'
          if (id.includes('node_modules/@supabase/supabase-js'))
            return 'vendor-supabase'
          if (id.includes('node_modules/lucide-react'))
            return 'vendor-lucide'
          if (id.includes('node_modules/react-router-dom'))
            return 'vendor-react-router'
          if (id.includes('node_modules/recharts'))
            return 'vendor-recharts'
          if (id.includes('node_modules/framer-motion'))
            return 'vendor-framer-motion'
          if (id.includes('node_modules/jspdf') || id.includes('node_modules/jspdf-autotable'))
            return 'vendor-jspdf'
          if (id.includes('node_modules/html2canvas'))
            return 'vendor-html2canvas'
          if (id.includes('node_modules/@radix-ui'))
            return 'vendor-radix'

          // ---- App chunks ----
          if (id.includes('src/components/auth')) return 'auth-pages'
          if (
            id.includes('src/components/pages/AdminDashboard') ||
            id.includes('src/components/pages/Dashboard')
          )
            return 'admin-dashboard'
          if (id.includes('src/components/pages/VehicleManagementPage'))
            return 'admin-vehicle'
          if (id.includes('src/components/pages/MaintenancePage'))
            return 'admin-maintenance'
          if (id.includes('src/components/pages/FullPayrollPage'))
            return 'admin-payroll'
          if (id.includes('src/components/pages/BrokerDashboard'))
            return 'broker-dashboard'
          if (
            id.includes('src/components/pages/DriversAvailablePage') ||
            id.includes('src/components/pages/LoadsPage')
          )
            return 'broker-drivers-loads'
          if (id.includes('src/components/pages/BrokerPayrollPage'))
            return 'broker-payroll'
          if (id.includes('src/components/pages/ShipmentsPage'))
            return 'broker-shipments'
          if (id.includes('src/components/pages/BrokerProfilePage'))
            return 'broker-profile'
          if (id.includes('src/components/pages/DriverDashboard'))
            return 'driver-pages'
          if (
            id.includes('src/components/pages/UserProfilePage') ||
            id.includes('src/components/pages/RouteCalculatorPage') ||
            id.includes('src/components/pages/UnauthorizedPage')
          )
            return 'shared-pages'
          if (id.includes('src/components/layout/GlobalNavbar')) return 'layout'
          if (id.includes('src/contexts/AuthContext')) return 'context'
        },
      },
    },
  },

  // 🧰 Optional: define server preview settings for local testing
  preview: {
    port: 4173,
    strictPort: true,
  },
})

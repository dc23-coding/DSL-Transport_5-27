// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true,
      filename: 'dist/stats.html',
      gzipSize: true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Map @/ to src/
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor dependencies
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-lucide': ['lucide-react'],
          'vendor-react-router': ['react-router-dom'],
          'vendor-react': ['react', 'react-dom'],
          'vendor-recharts': ['recharts'],
          'vendor-framer-motion': ['framer-motion'],
          'vendor-jspdf': ['jspdf', 'jspdf-autotable'],
          'vendor-radix': [
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-label',
            '@radix-ui/react-slider',
            '@radix-ui/react-slot',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
          ],
          // Group pages by role
          'auth-pages': [
            '@/components/auth/Login',
            '@/components/auth/Register',
            '@/components/auth/HomeRouter',
            '@/components/auth/ProtectedRoute',
          ],
          'admin-pages': [
            '@/components/pages/AdminDashboard',
            '@/components/pages/Dashboard',
            '@/components/pages/VehicleManagementPage',
            '@/components/pages/MaintenancePage',
            '@/components/pages/FullPayrollPage',
          ],
          'broker-pages': [
            '@/components/pages/BrokerDashboard',
            '@/components/pages/DriversAvailablePage',
            '@/components/pages/LoadsPage',
            '@/components/pages/BrokerPayrollPage',
            '@/components/pages/ShipmentsPage',
            '@/components/pages/BrokerProfilePage',
          ],
          'driver-pages': ['@/components/pages/DriverDashboard'],
          'shared-pages': [
            '@/components/pages/UserProfilePage',
            '@/components/pages/RouteCalculatorPage',
            '@/components/pages/UnauthorizedPage',
          ],
          'layout': ['@/components/layout/GlobalNavbar'],
        },
      },
    },
    chunkSizeWarningLimit: 500,
    minify: 'terser', // Use terser for aggressive minification
    sourcemap: false, // Disable for smaller build
  },
});
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
    visualizer({
      open: true,
      filename: 'dist/stats.html',
      gzipSize: true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-lucide': ['lucide-react'],
          'vendor-react-router': ['react-router-dom'],
          'vendor-react': ['react', 'react-dom'],
          'vendor-recharts': ['recharts'],
          'vendor-framer-motion': ['framer-motion'],
          'vendor-jspdf': ['jspdf', 'jspdf-autotable'],
          'vendor-html2canvas': ['html2canvas'],
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
          'auth-pages': [
            '@/components/auth/Login',
            '@/components/auth/Register',
            '@/components/auth/HomeRouter',
            '@/components/auth/ProtectedRoute',
          ],
          'admin-dashboard': ['@/components/pages/AdminDashboard', '@/components/pages/Dashboard'],
          'admin-vehicle': ['@/components/pages/VehicleManagementPage'],
          'admin-maintenance': ['@/components/pages/MaintenancePage'],
          'admin-payroll': ['@/components/pages/FullPayrollPage'],
          'broker-dashboard': ['@/components/pages/BrokerDashboard'],
          'broker-drivers-loads': ['@/components/pages/DriversAvailablePage', '@/components/pages/LoadsPage'],
          'broker-payroll': ['@/components/pages/BrokerPayrollPage'],
          'broker-shipments': ['@/components/pages/ShipmentsPage'],
          'broker-profile': ['@/components/pages/BrokerProfilePage'],
          'driver-pages': ['@/components/pages/DriverDashboard'],
          'shared-pages': [
            '@/components/pages/UserProfilePage',
            '@/components/pages/RouteCalculatorPage',
            '@/components/pages/UnauthorizedPage',
          ],
          'layout': ['@/components/layout/GlobalNavbar'],
          'context': ['@/contexts/AuthContext'],
        },
      },
    },
    chunkSizeWarningLimit: 600, // Temporary increase
    minify: 'terser',
    sourcemap: false,
    cssCodeSplit: true,
  },
});
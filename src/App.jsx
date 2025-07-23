import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import HomeRouter from '@/components/auth/HomeRouter';
import GlobalNavbar from '@/components/layout/GlobalNavbar';
import UnauthorizedPage from '@/components/pages/UnauthorizedPage';

// Lazy-loaded components
const Login = lazy(() => import('@/components/auth/Login'));
const Register = lazy(() => import('@/components/auth/Register'));
const Dashboard = lazy(() => import('@/components/pages/Dashboard'));
const AdminDashboard = lazy(() => import('@/components/pages/AdminDashboard'));
const BrokerDashboard = lazy(() => import('@/components/pages/BrokerDashboard'));
const DriverDashboard = lazy(() => import('@/components/pages/DriverDashboard'));
const VehicleManagementPage = lazy(() => import('@/components/pages/VehicleManagementPage'));
const MaintenancePage = lazy(() => import('@/components/pages/MaintenancePage'));
const UserProfilePage = lazy(() => import('@/components/pages/UserProfilePage'));
const FullPayrollPage = lazy(() => import('@/components/pages/FullPayrollPage'));
const RouteCalculatorPage = lazy(() => import('@/components/pages/RouteCalculatorPage'));
const DriversAvailablePage = lazy(() => import('@/components/pages/DriversAvailablePage'));
const LoadsPage = lazy(() => import('@/components/pages/LoadsPage'));
const BrokerPayrollPage = lazy(() => import('@/components/pages/BrokerPayrollPage'));
const ShipmentsPage = lazy(() => import('@/components/pages/ShipmentsPage'));
const BrokerProfilePage = lazy(() => import('@/components/pages/BrokerProfilePage'));

function App() {
  return (
    <AuthProvider>
      <Router>
        <GlobalNavbar />
        <Suspense fallback={<div className="p-4">Loading...</div>}>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Role-based redirect */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <HomeRouter />
                </ProtectedRoute>
              }
            />

            {/* Admin-only routes */}
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vehicles"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <VehicleManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/maintenance"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <MaintenancePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <FullPayrollPage />
                </ProtectedRoute>
              }
            />

            {/* Broker-only routes */}
            <Route
              path="/broker-dashboard"
              element={
                <ProtectedRoute allowedRoles={['broker']}>
                  <BrokerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/drivers-available"
              element={
                <ProtectedRoute allowedRoles={['broker']}>
                  <DriversAvailablePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/loads"
              element={
                <ProtectedRoute allowedRoles={['broker']}>
                  <LoadsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/broker-payroll"
              element={
                <ProtectedRoute allowedRoles={['broker']}>
                  <BrokerPayrollPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shipments"
              element={
                <ProtectedRoute allowedRoles={['broker']}>
                  <ShipmentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/broker-profile"
              element={
                <ProtectedRoute allowedRoles={['broker']}>
                  <BrokerProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Driver-only */}
            <Route
              path="/driver-dashboard"
              element={
                <ProtectedRoute allowedRoles={['driver']}>
                  <DriverDashboard />
                </ProtectedRoute>
              }
            />

            {/* Shared (all authenticated) */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <UserProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/route-calculator"
              element={
                <ProtectedRoute>
                  <RouteCalculatorPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route
              path="*"
              element={
                <ProtectedRoute>
                  <HomeRouter />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
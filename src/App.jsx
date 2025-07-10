// src/App.jsx
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import HomeRouter from '@/components/auth/HomeRouter';
import GlobalNavControls from '@/components/GlobalNavControls';
import UnauthorizedPage from '@/components/pages/UnauthorizedPage';

// Lazy-loaded components for code-splitting
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

function App() {
  return (
    <AuthProvider>
      <Router>
        <GlobalNavControls />
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

            {/* Broker-only */}
            <Route
              path="/broker-dashboard"
              element={
                <ProtectedRoute allowedRoles={['broker']}>
                  <BrokerDashboard />
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

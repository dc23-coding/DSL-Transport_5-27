// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import HomeRouter from '@/components/auth/HomeRouter';
import Login from '@/components/auth/Login';
import Register from '@/components/auth/Register';
import Dashboard from '@/components/pages/Dashboard';
import AdminDashboard from '@/components/pages/AdminDashboard';
import BrokerDashboard from '@/components/pages/BrokerDashboard';
import DriverDashboard from '@/components/pages/DriverDashboard';
import VehicleManagementPage from '@/components/pages/VehicleManagementPage';
import MaintenancePage from '@/components/pages/MaintenancePage';
import UserProfilePage from '@/components/pages/UserProfilePage';
import FullPayrollPage from '@/components/pages/FullPayrollPage';
import RouteCalculatorPage from '@/components/pages/RouteCalculatorPage';
import GlobalNavControls from '@/components/GlobalNavControls';

function App() {
  return (
    <AuthProvider>
      <Router>
        <GlobalNavControls />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Root: redirect by role */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomeRouter />
              </ProtectedRoute>
            }
          />

          {/* Admin-only pages */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={[ 'admin' ]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={[ 'admin' ]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vehicles"
            element={
              <ProtectedRoute allowedRoles={[ 'admin' ]}>
                <VehicleManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/maintenance"
            element={
              <ProtectedRoute allowedRoles={[ 'admin' ]}>
                <MaintenancePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payroll"
            element={
              <ProtectedRoute allowedRoles={[ 'admin' ]}>
                <FullPayrollPage />
              </ProtectedRoute>
            }
          />

          {/* Broker-only page */}
          <Route
            path="/broker-dashboard"
            element={
              <ProtectedRoute allowedRoles={[ 'broker' ]}>
                <BrokerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Driver-only page */}
          <Route
            path="/driver-dashboard"
            element={
              <ProtectedRoute allowedRoles={[ 'driver' ]}>
                <DriverDashboard />
              </ProtectedRoute>
            }
          />

          {/* Shared pages */}
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
      </Router>
    </AuthProvider>
  );
}

export default App;

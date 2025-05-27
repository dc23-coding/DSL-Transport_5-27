// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import HomeRouter from '@/components/HomeRouter';
import Dashboard from '@/components/Dashboard';
import DriverDashboard from '@/components/dashboards/DriverDashboard';
import BrokerDashboard from '@/components/dashboards/BrokerDashboard';
import FullPayrollPage from '@/components/pages/FullPayrollPage';
import VehicleManagementPage from '@/components/pages/VehicleManagementPage';
import MaintenancePage from '@/components/pages/MaintenancePage';
import UserProfilePage from '@/components/pages/UserProfilePage';
import Login from '@/components/auth/Login';
import Register from '@/components/auth/Register';
import GlobalNavControls from '@/components/GlobalNavControls';
import RouteCalculatorPage from '@/components/pages/RouteCalculatorPage';
import DriverManagementPage from '@/components/pages/DriverManagementPage';
import RoleRouter from '@/components/HomeRouter'; // alias for clarity
import Sidebar from '@/components/Sidebar';
import FileUploadsPage from '@/components/pages/FileUploadsPage';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, userRole, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(userRole) && userRole !== 'admin') {
    return <Navigate to="/" />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background text-foreground flex flex-col">
          <Header />
          <main className="flex-1 container mx-auto px-4 py-6">
            <Routes>
              {/* role-based landing at "/" */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <HomeRouter />
                  </ProtectedRoute>
                }
              />

              {/* Admin workspace */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* admin-only pages */}
              <Route
                path="/payroll"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <FullPayrollPage />
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
                path="/profile"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <UserProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* broker & driver dashboards (optional direct routes) */}
              <Route
                path="/driver-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['driver']}>
                    <DriverDashboard />
                  </ProtectedRoute>
                }
/>

              <Route
                path="/broker-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['broker']}>
                    <BrokerDashboard />
                  </ProtectedRoute>
                }
              />


              {/* auth */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* protected tools */}
              <Route
                path="/route-calculator"
                element={
                  <ProtectedRoute>
                    <RouteCalculatorPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/driver-management"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <DriverManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/uploads"
                element={
                  <ProtectedRoute>
                    <FileUploadsPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <Toaster />
          <GlobalNavControls />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

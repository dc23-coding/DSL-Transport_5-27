import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
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
import LoadForm from '@/components/forms/LoadForm';

// import MaintenancePage from '@/components/pages/MaintenancePage';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, userRole, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(userRole) && userRole !== 'admin') return <Navigate to="/" />;
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
              {/* Default Admin Overview */}
              <Route path="/" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

              {/* Admin Workspace */}
              <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><Dashboard /></ProtectedRoute>} />

              {/* Role-Based Dashboards */}
              <Route path="/driver-dashboard" element={<ProtectedRoute allowedRoles={['driver']}><DriverDashboard /></ProtectedRoute>} />
              <Route path="/broker-dashboard" element={<ProtectedRoute allowedRoles={['broker']}><BrokerDashboard /></ProtectedRoute>} />

              {/* Admin-Only Pages */}
              <Route path="/payroll" element={<ProtectedRoute allowedRoles={['admin']}><FullPayrollPage /></ProtectedRoute>} />

              {/* Newly Added Pages */}
              <Route path="/vehicles" element={<ProtectedRoute allowedRoles={['admin']}><VehicleManagementPage /></ProtectedRoute>} />
              <Route path="/maintenance" element={<ProtectedRoute allowedRoles={['admin']}><MaintenancePage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute allowedRoles={['admin']}><UserProfilePage /></ProtectedRoute>} />

              {/* Auth Pages */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Tools */}
              <Route path="/route-calculator" element={<RouteCalculatorPage />} />
              <Route path="/vehicles"    element={<ProtectedRoute allowedRoles={['admin']}><VehicleManagementPage /></ProtectedRoute>} />
              <Route path="/maintenance" element={<ProtectedRoute allowedRoles={['admin']}><MaintenancePage /></ProtectedRoute>} />
              <Route path="/profile"     element={<ProtectedRoute allowedRoles={['admin']}><UserProfilePage /></ProtectedRoute>} />
              <Route path="/driver-management"  element={<ProtectedRoute allowedRoles={['admin']}><DriverManagementPage /></ProtectedRoute>} />
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

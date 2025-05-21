// src/components/HomeRouter.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import DriverDashboard from '@/components/dashboards/DriverDashboard';
import BrokerDashboard from '@/components/dashboards/BrokerDashboard';

const HomeRouter = () => {
  const { user, userRole, loading } = useAuth();

  // show loading state while auth is initializing
  if (loading) return <div>Loading...</div>;

  // redirect unauthenticated users to login
  if (!user) return <Navigate to="/login" />;

  // render dashboard based on role
  if (userRole === 'admin') return <AdminDashboard />;
  if (userRole === 'driver') return <DriverDashboard />;
  if (userRole === 'broker') return <BrokerDashboard />;

  // fallback to login on unknown role
  return <Navigate to="/login" />;
};

export default HomeRouter;

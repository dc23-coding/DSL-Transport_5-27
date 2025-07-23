import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const HomeRouter = () => {
  const { user, userRole, loading } = useAuth();

  if (loading) {
    console.log('🧠 HomeRouter: Loading auth state...');
    return <div>Loading...</div>;
  }

  if (user === null) {
    console.log('🧠 HomeRouter: Redirecting to /login (user is null)');
    return <Navigate to="/login" replace />;
  }

  console.log('🧠 HomeRouter User:', user?.email, 'ID:', user?.id);
  console.log('🧠 HomeRouter User Role:', userRole);

  switch (userRole) {
    case 'admin':
      return <Navigate to="/admin-dashboard" replace />;
    case 'driver':
      return <Navigate to="/driver-dashboard" replace />;
    case 'broker':
      return <Navigate to="/broker-dashboard" replace />;
    default:
      console.log('🧠 HomeRouter: Falling to unauthorized due to invalid role:', userRole);
      return <Navigate to="/unauthorized" replace />;
  }
};

export default HomeRouter;
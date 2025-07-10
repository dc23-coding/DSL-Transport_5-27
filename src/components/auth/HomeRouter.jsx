import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const HomeRouter = () => {
  const { user, devBypass } = useAuth();
  const userRole = user?.user_metadata?.role;

  if (user === undefined) return <div>Loading...</div>;
  if (user === null) return <Navigate to="/login" replace />;

  if (devBypass) {
    console.warn('🚧 Dev bypass active');
    return <Navigate to="/admin-dashboard" replace />;
  }

  console.log('🧠 USER:', user);
  console.log('🧠 USER ROLE:', userRole);

  switch (userRole) {
    case 'admin':
      return <Navigate to="/admin-dashboard" replace />;
    case 'driver':
      return <Navigate to="/driver-dashboard" replace />;
    case 'broker':
      return <Navigate to="/broker-dashboard" replace />;
    default:
      return <Navigate to="/unauthorized" replace />;
  }
};

export default HomeRouter;

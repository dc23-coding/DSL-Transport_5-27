// src/components/auth/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, userRole, loading } = useAuth();

  if (loading) return null;

  console.log('🔐 user:', user);
  console.log('🔐 userRole:', userRole);

  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    console.warn('❌ Role not allowed:', userRole);
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;


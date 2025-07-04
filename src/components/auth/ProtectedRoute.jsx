// src/components/auth/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, userRole } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(userRole)) return <Navigate to="/" replace />;
  return children;
};

export default ProtectedRoute;
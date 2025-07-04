// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
const { user, role, loading } = useAuth();
if (loading) return null;
if (!user) return ;
if (allowedRoles.length && !allowedRoles.includes(role)) {
return ;
}
return children;
};

export default ProtectedRoute;
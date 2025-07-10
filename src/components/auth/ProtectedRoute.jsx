// src/components/auth/ProtectedRoute.jsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, userRole, loading: authLoading, error: authError, devBypass } = useAuth();
  const [session, setSession] = useState(null);
  const [sessionError, setSessionError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        setSession(data.session);
      } catch (err) {
        console.error('🔴 Supabase session fetch error:', err);
        setSessionError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, []);

  if (authLoading || loading) {
    return <div className="text-center mt-8">🔐 Authenticating...</div>;
  }

  if (authError || sessionError) {
    console.error('🔴 Auth Errors:', authError || sessionError);
    return <Navigate to="/login" replace />;
  }

  if (devBypass) {
    console.warn('🚧 Dev bypass enabled. Skipping role check.');
    return children;
  }

  if (!user || !session?.user) {
    console.warn('🚫 No authenticated user. Redirecting to /login.');
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    console.warn(`⛔ Role "${userRole}" not allowed. Redirecting.`);
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;

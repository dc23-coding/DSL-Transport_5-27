import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase'; // Ensure you export supabase client

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, userRole, loading, error } = useAuth();

  // Extra check: Verify Supabase session
  const [supabaseSession, setSupabaseSession] = React.useState(null);
  const [supabaseError, setSupabaseError] = React.useState(null);

  React.useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        setSupabaseSession(session);
      } catch (err) {
        setSupabaseError(err);
        console.error('🔴 Supabase session error:', err);
      }
    };
    fetchSession();
  }, []);

  if (loading || !supabaseSession) {
    return <div className="text-center mt-8">Loading...</div>;
  }

  if (error || supabaseError) {
    console.error('🔴 Auth Error:', error || supabaseError);
    return <Navigate to="/login" replace />;
  }

  if (!user || !supabaseSession?.user) {
    console.warn('🚫 No user. Redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    console.warn(`🚫 Role "${userRole}" not allowed. Redirecting to /unauthorized`);
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
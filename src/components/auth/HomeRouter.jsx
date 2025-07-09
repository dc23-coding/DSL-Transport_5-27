import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const HomeRouter = () => {
  const navigate = useNavigate();
  const { user, devBypass } = useAuth();
  const userRole = user?.user_metadata?.role;

  useEffect(() => {
    // ⚠️ If dev bypass is active, always go to admin dashboard
    if (devBypass) {
      console.warn('🚧 Dev bypass active');
      navigate('/admin-dashboard', { replace: true });
      return;
    }

    // 🚫 If user is not logged in, send to login
    if (user === null) {
      navigate('/login', { replace: true });
      return;
    }

    // ✅ Once user is available, redirect based on role
    if (user) {
      console.log('🧠 USER:', user);
      console.log('🧠 USER ROLE:', userRole);

      switch (userRole) {
        case 'admin':
          navigate('/admin-dashboard', { replace: true });
          break;
        case 'driver':
          navigate('/driver-dashboard', { replace: true });
          break;
        case 'broker':
          navigate('/broker-dashboard', { replace: true });
          break;
        default:
          navigate('/', { replace: true }); // fallback
      }
    }
  }, [user, userRole, devBypass, navigate]);

  // ⏳ Wait if user state hasn't been determined yet
  if (user === undefined) return <div>Loading...</div>;

  return null;
};

export default HomeRouter;

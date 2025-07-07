// ✅ HomeRouter.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const HomeRouter = () => {
  const navigate = useNavigate();
  const { user, devBypass } = useAuth();
  const userRole = user?.user_metadata?.role;

  useEffect(() => {
    if (devBypass) {
      console.warn('🚧 Dev bypass active');
      navigate('/admin-dashboard');
      return;
    }

    if (!user) return navigate('/login');

    console.log('🧠 USER:', user);
    console.log('🧠 USER ROLE:', user?.user_metadata?.role);


    switch (userRole) {
      case 'admin': return navigate('/admin-dashboard');
      case 'driver': return navigate('/driver-dashboard');
      case 'broker': return navigate('/broker-dashboard');
      default: return navigate('/');
    }
  }, [user, userRole, devBypass, navigate]);

  return null;
};

export default HomeRouter;
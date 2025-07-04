// src/components/auth/HomeRouter.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const HomeRouter = () => {
  const navigate = useNavigate();
  const { user, userRole } = useAuth();

  useEffect(() => {
    if (user) {
      switch (userRole) {
        case 'admin':
          navigate('/admin-dashboard');
          break;
        case 'broker':
          navigate('/broker-dashboard');
          break;
        case 'driver':
          navigate('/driver-dashboard');
          break;
        default:
          navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [user, userRole, navigate]);

  return null;
};

export default HomeRouter;
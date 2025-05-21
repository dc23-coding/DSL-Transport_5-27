import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const useLogout = () => {
  const { setUser, setUserRole, setAdminMode } = useAuth();
  const navigate = useNavigate();

  const logout = () => {
    console.debug('[useLogout] Clearing user session.');
    setUser(null);
    setUserRole(null);
    setAdminMode(false);
    navigate('/login');
  };

  return { logout };
};
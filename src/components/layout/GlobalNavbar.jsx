// /src/components/layout/GlobalNavbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLogout } from '@/hooks/useLogout';

const GlobalNavbar = () => {
  const { user, userRole } = useAuth();
  const { logout } = useLogout();
  const navigate = useNavigate();

  console.debug('[GlobalNavbar] user:', user);
  console.debug('[GlobalNavbar] userRole:', userRole);

  const handleLogout = () => {
    console.debug('[GlobalNavbar] Logout initiated');
    logout();
    navigate('/');
  };

  const navLinks = [
    { label: 'Dashboard', path: userRole === 'admin' ? '/dashboard' : `/${userRole}-dashboard` },
    { label: 'Drivers', path: '/drivers' },
    { label: 'Loads', path: '/loads' },
    { label: 'Payroll', path: '/payroll' },
    { label: 'Lounge', path: '/driver-lounge' },
  ];

  console.debug('[GlobalNavbar] navLinks:', navLinks);

  return (
    <nav className="w-full bg-background border-b border-border p-4 flex justify-between items-center shadow-sm">
      <div className="flex items-center gap-4">
        <span className="text-xl font-bold">DSL Transport</span>
        <div className="hidden md:flex gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.path}
              className="hover:underline text-sm"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 text-sm hover:underline"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>

        <div className="md:hidden">
          <Menu className="h-5 w-5" />
          {/* TODO: Implement mobile drawer or dropdown */}
        </div>
      </div>
    </nav>
  );
};

export default GlobalNavbar;

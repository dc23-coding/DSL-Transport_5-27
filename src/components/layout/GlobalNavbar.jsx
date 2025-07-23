import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LogOutIcon from 'lucide-react/dist/esm/icons/log-out';
import MenuIcon from 'lucide-react/dist/esm/icons/menu';
import XIcon from 'lucide-react/dist/esm/icons/x';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

const GlobalNavbar = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const navItems = {
    admin: [
      { to: '/admin-dashboard', label: 'Dashboard' },
      { to: '/vehicles', label: 'Vehicles' },
      { to: '/payroll', label: 'Payroll' },
    ],
    driver: [
      { to: '/driver-dashboard', label: 'My Routes' },
    ],
    broker: [
      { to: '/broker-dashboard', label: 'Dashboard' },
      { to: '/drivers-available', label: 'Drivers Available' },
      { to: '/loads', label: 'New Loads' },
      { to: '/broker-payroll', label: 'Payments (1040)' },
      { to: '/shipments', label: 'Shipments' },
      { to: '/broker-profile', label: 'Profile' },
    ],
  };

  const navLinks = user && userRole ? navItems[userRole] : [
    { to: '/login', label: 'Login' },
    { to: '/register', label: 'Register' },
  ];

  return (
    <nav className="w-full bg-background border-b border-border p-4 flex justify-between items-center shadow-sm">
      <div className="flex items-center gap-4">
        <span className="text-xl font-bold">DSL Transport</span>
        <div className="hidden md:flex gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="hover:underline text-sm"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {user && (
          <button
            onClick={handleLogout}
            className="hidden md:flex items-center gap-1 text-sm hover:underline"
          >
            <LogOutIcon className="h-4 w-4" />
            Logout
          </button>
        )}
        <div className="md:hidden relative">
          <button
            onClick={toggleDropdown}
            aria-expanded={isDropdownOpen}
            aria-controls="mobile-menu"
            className="flex items-center text-sm"
          >
            {isDropdownOpen ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
          {isDropdownOpen && (
            <div
              id="mobile-menu"
              className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-md shadow-lg z-10"
            >
              <div className="flex flex-col p-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsDropdownOpen(false)}
                    className="block py-2 px-4 text-sm hover:bg-accent hover:underline"
                  >
                    {link.label}
                  </Link>
                ))}
                {user && (
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 py-2 px-4 text-sm hover:bg-accent hover:underline text-left"
                  >
                    <LogOutIcon className="h-4 w-4" />
                    Logout
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default GlobalNavbar;
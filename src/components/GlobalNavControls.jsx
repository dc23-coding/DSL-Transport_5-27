import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Truck, Compass, DollarSign, User, Settings, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function GlobalNavControls() {
  const { user, userRole } = useAuth();
  if (!user) return null; // hide nav when not logged in

  const commonLinks = [
    { to: '/route-calculator', label: 'Trip Planner', icon: Compass },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  const roleLinks = {
    admin: [
      { to: '/dashboard', label: 'Dashboard', icon: Home },
      { to: '/payroll', label: 'Payroll', icon: DollarSign },
      { to: '/vehicles', label: 'Vehicles', icon: Truck },
      { to: '/maintenance', label: 'Maintenance', icon: Settings },
      { to: '/driver-management', label: 'Drivers', icon: Users },
    ],
    driver: [
      { to: '/driver-dashboard', label: 'My Loads', icon: Truck },
    ],
    broker: [
      { to: '/broker-dashboard', label: 'My Shipments', icon: Truck },
    ],
  };

  const links = [
    ...(roleLinks[userRole] || []),
    ...commonLinks,
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface-dark border-t border-border">
      <div className="flex justify-around py-2">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center text-xs ${
                isActive ? 'text-primary' : 'text-foreground'
              }`
            }
          >
            <Icon className="w-6 h-6 mb-1" />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

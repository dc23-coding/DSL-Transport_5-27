import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { NavLink } from 'react-router-dom';
import { Home, Truck, Compass, DollarSign, User, Settings, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function GlobalNavControls() {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    }
  };

  const handleForward = () => {
    navigate(1);
  };
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

  const openRouteCalculator = () => {
    navigate('/route-calculator');
  };
  const links = [
    ...(roleLinks[userRole] || []),
    ...commonLinks,
  ];

  return (
    <>
      <div className="fixed bottom-14 left-1/2 transform -translate-x-1/2 flex gap-2 z-50">
        <Button 
          onClick={handleBack} 
          variant="outline" 
          size="sm" 
          className="rounded-full"
          aria-label="Go Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <Button 
          onClick={openRouteCalculator} 
          variant="default" 
          size="sm" 
          className="rounded-full"
          aria-label="Route Calculator"
        >
          <MapPin className="h-4 w-4" />
        </Button>

        <Button 
          onClick={handleForward} 
          variant="outline" 
          size="sm" 
          className="rounded-full"
          aria-label="Go Forward"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
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
    </>
  );
}
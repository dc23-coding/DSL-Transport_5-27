import React, { useCallback, useMemo } from 'react';
import { useNavigate, NavLink, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Home, Truck, Compass, DollarSign, User, Settings, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

// Route constants
const ROUTES = {
  DASHBOARD: '/',
  DRIVER_DASHBOARD: '/driver-dashboard',
  BROKER_DASHBOARD: '/broker-dashboard',
  PAYROLL: '/payroll',
  VEHICLES: '/vehicles',
  MAINTENANCE: '/maintenance',
  DRIVER_MANAGEMENT: '/driver-management',
  TRIP_PLANNER: '/route-calculator',
  PROFILE: '/profile',
};

const GlobalNavControls = () => {
  // All hooks at the top, unconditionally
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userRole } = useAuth();

  const commonLinks = [
    { to: ROUTES.TRIP_PLANNER, label: 'Trip Planner', icon: Compass },
    { to: ROUTES.PROFILE, label: 'Profile', icon: User },
  ];

  const roleLinks = {
    admin: [
      { to: ROUTES.DASHBOARD, label: 'Dashboard', icon: Home },
      { to: ROUTES.PAYROLL, label: 'Payroll', icon: DollarSign },
      { to: ROUTES.VEHICLES, label: 'Vehicles', icon: Truck },
      { to: ROUTES.MAINTENANCE, label: 'Maintenance', icon: Settings },
      { to: ROUTES.DRIVER_MANAGEMENT, label: 'Drivers', icon: Users },
    ],
    driver: [
      { to: ROUTES.DRIVER_DASHBOARD, label: 'My Loads', icon: Truck },
    ],
    broker: [
      { to: ROUTES.BROKER_DASHBOARD, label: 'My Shipments', icon: Truck },
    ],
  };

  // Memoize links array
  const links = useMemo(() => [
    ...(roleLinks[userRole] || []),
    ...commonLinks,
  ], [userRole]);

  // Memoize navigation handlers
  const handleBack = useCallback(() => {
    if (window.history.length > 1) navigate(-1);
  }, [navigate]);

  const handleForward = useCallback(() => {
    navigate(1);
  }, [navigate]);

  const openRouteCalculator = useCallback(() => {
    navigate(ROUTES.TRIP_PLANNER);
  }, [navigate]);

  // Early return after all hooks
  if (!user || ['/login', '/register'].includes(location.pathname)) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-16 left-1/2 transform -translate-x-1/2 flex gap-2 z-50 md:bottom-20">
        <Button
          onClick={handleBack}
          variant="outline"
          size="sm"
          className="rounded-full hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button
          onClick={openRouteCalculator}
          variant="default"
          size="sm"
          className="rounded-full hover:bg-primary/90 transition-colors"
        >
          <MapPin className="h-4 w-4" />
        </Button>
        <Button
          onClick={handleForward}
          variant="outline"
          size="sm"
          className="rounded-full hover:bg-muted transition-colors"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
      <nav className="fixed bottom-0 left-0 right-0 bg-surface-dark border-t border-border z-50 pb-safe">
        <div className="flex justify-around py-3">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center text-xs transition-colors duration-200',
                  isActive ? 'text-primary' : 'text-foreground hover:text-primary/80'
                )
              }
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="truncate max-w-[80px]">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
};

export default GlobalNavControls;
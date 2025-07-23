// src/components/pages/DriversAvailablePage.jsx
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

const DriversAvailablePage = () => {
  const { user } = useAuth();
  return (
    <div className="p-4">
      <h1>Drivers Available</h1>
      <p>View available drivers for {user?.email}</p>
      {/* TODO: Implement drivers list */}
    </div>
  );
};

export default DriversAvailablePage;
// src/components/pages/ShipmentsPage.jsx
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

const ShipmentsPage = () => {
  const { user } = useAuth();
  return (
    <div className="p-4">
      <h1>Shipments</h1>
      <p>View shipments for {user?.email}</p>
      {/* TODO: Implement shipments functionality */}
    </div>
  );
};

export default ShipmentsPage;
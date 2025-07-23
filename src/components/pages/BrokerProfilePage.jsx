// src/components/pages/BrokerProfilePage.jsx
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

const BrokerProfilePage = () => {
  const { user } = useAuth();
  return (
    <div className="p-4">
      <h1>Broker Profile</h1>
      <p>Profile details for {user?.email}</p>
      {/* TODO: Implement profile management */}
    </div>
  );
};

export default BrokerProfilePage;
// src/components/pages/BrokerPayrollPage.jsx
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

const BrokerPayrollPage = () => {
  const { user } = useAuth();
  return (
    <div className="p-4">
      <h1>Payments (1040)</h1>
      <p>Manage payments for {user?.email}</p>
      {/* TODO: Implement payment (1040) functionality */}
    </div>
  );
};

export default BrokerPayrollPage;
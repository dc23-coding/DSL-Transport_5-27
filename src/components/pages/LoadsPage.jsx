// src/components/pages/LoadsPage.jsx
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

const LoadsPage = () => {
  const { user } = useAuth();
  return (
    <div className="p-4">
      <h1>New Loads</h1>
      <p>Manage loads for {user?.email}</p>
      {/* TODO: Implement loads functionality */}
    </div>
  );
};

export default LoadsPage;
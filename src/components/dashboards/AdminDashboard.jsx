import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="p-4 bg-background text-foreground min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <p className="mb-2">Welcome, {user?.email || 'Admin'}</p>
      <div className="flex gap-4">
        <div className="p-4 bg-card rounded-lg shadow glass-effect">
          <h2 className="text-lg font-semibold">Overview</h2>
          <p>Manage vehicles, payroll, and maintenance.</p>
        </div>
        <div className="p-4 bg-card rounded-lg shadow glass-effect">
          <h2 className="text-lg font-semibold">Quick Actions</h2>
          <button className="btn btn-primary">View Payroll</button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
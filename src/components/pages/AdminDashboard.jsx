// src/components/pages/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [driversCount, setDriversCount] = useState(0);
  const [brokersCount, setBrokersCount] = useState(0);
  const [loadsCount, setLoadsCount] = useState(0);
  const [shipmentsCount, setShipmentsCount] = useState(0);
  const [recentLoads, setRecentLoads] = useState([]);
  const [recentShipments, setRecentShipments] = useState([]);

  useEffect(() => {
    async function fetchOverview() {
      const [{ count: dCount }, { count: bCount }, { count: lCount }, { count: sCount }] = await Promise.all([
        supabase.from('users').select('id', { head: true, count: 'exact' }).eq('role', 'driver'),
        supabase.from('users').select('id', { head: true, count: 'exact' }).eq('role', 'broker'),
        supabase.from('loads').select('id', { head: true, count: 'exact' }),
        supabase.from('shipments').select('id', { head: true, count: 'exact' }),
      ]);
      setDriversCount(dCount || 0);
      setBrokersCount(bCount || 0);
      setLoadsCount(lCount || 0);
      setShipmentsCount(sCount || 0);

      const { data: loads } = await supabase
        .from('loads')
        .select('id,pickup_location,delivery_location,pickup_date')
        .order('pickup_date', { ascending: false })
        .limit(5);
      const { data: shipments } = await supabase
        .from('shipments')
        .select('id,pickup_location,delivery_location,status,pickup_date')
        .order('pickup_date', { ascending: false })
        .limit(5);
      setRecentLoads(loads || []);
      setRecentShipments(shipments || []);
    }
    fetchOverview();
  }, []);

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Overview</h1>
        <nav className="flex flex-wrap gap-4">
          <Link to="/dashboard" className="bg-primary text-white px-4 py-2 rounded">
            Dashboard
          </Link>  
          <Link to="/vehicles" className="text-primary font-medium">Vehicles</Link>
          <Link to="/maintenance" className="text-primary font-medium">Maintenance</Link>
          <Link to="/payroll" className="text-primary font-medium">Payroll</Link>
          <Link to="/route-calculator" className="text-primary font-medium">Route Calculator</Link>
          <Link to="/profile" className="text-primary font-medium">Profile</Link>
        </nav>
      </div>

      <p className="mb-6">Welcome back, {user.full_name || user.email}!</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card p-4 rounded shadow-sm text-center">
          <h3 className="text-lg font-semibold">Drivers</h3>
          <p className="text-2xl mt-1">{driversCount}</p>
        </div>
        <div className="bg-card p-4 rounded shadow-sm text-center">
          <h3 className="text-lg font-semibold">Brokers</h3>
          <p className="text-2xl mt-1">{brokersCount}</p>
        </div>
        <div className="bg-card p-4 rounded shadow-sm text-center">
          <h3 className="text-lg font-semibold">Loads</h3>
          <p className="text-2xl mt-1">{loadsCount}</p>
        </div>
        <div className="bg-card p-4 rounded shadow-sm text-center">
          <h3 className="text-lg font-semibold">Shipments</h3>
          <p className="text-2xl mt-1">{shipmentsCount}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-8">
        <Link to="/vehicles" className="bg-primary text-white px-4 py-2 rounded">Manage Vehicles</Link>
        <Link to="/maintenance" className="bg-primary text-white px-4 py-2 rounded">Maintenance</Link>
        <Link to="/payroll" className="bg-primary text-white px-4 py-2 rounded">Payroll</Link>
        <Link to="/route-calculator" className="bg-primary text-white px-4 py-2 rounded">Route Calculator</Link>
        <Link to="/profile" className="bg-primary text-white px-4 py-2 rounded">Profile</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="bg-card p-4 rounded shadow-sm">
          <h2 className="text-2xl font-semibold mb-2">Recent Loads</h2>
          {recentLoads.length ? (
            <ul className="list-disc list-inside space-y-1">
              {recentLoads.map(l => (
                <li key={l.id}>
                  {l.pickup_location} → {l.delivery_location} ({new Date(l.pickup_date).toLocaleDateString()})
                </li>
              ))}
            </ul>
          ) : (
            <p>No recent loads.</p>
          )}
        </section>

        <section className="bg-card p-4 rounded shadow-sm">
          <h2 className="text-2xl font-semibold mb-2">Recent Shipments</h2>
          {recentShipments.length ? (
            <ul className="list-disc list-inside space-y-1">
              {recentShipments.map(s => (
                <li key={s.id}>
                  {s.pickup_location} → {s.delivery_location} ({new Date(s.pickup_date).toLocaleDateString()}) – {s.status}
                </li>
              ))}
            </ul>
          ) : (
            <p>No recent shipments.</p>
          )}
        </section>
      </div>
    </div>
  );
}
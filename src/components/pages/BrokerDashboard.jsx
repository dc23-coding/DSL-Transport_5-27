// src/components/pages/BrokerDashboard.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function BrokerDashboard() {
  const { user } = useAuth();
  const [shipments, setShipments] = useState([]);

  useEffect(() => {
    async function fetchShipments() {
      const { data, error } = await supabase
        .from('shipments')
        .select('*')
        .eq('broker_id', user.id)
        .order('pickup_date', { ascending: true });
      if (!error) setShipments(data);
    }
    fetchShipments();
  }, [user.id]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">My Shipments</h1>
      {shipments.length ? (
        <table className="min-w-full bg-card">
          <thead>
            <tr>
              <th className="px-4 py-2">Pickup</th>
              <th className="px-4 py-2">Delivery</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {shipments.map(s => (
              <tr key={s.id} className="border-t">
                <td className="px-4 py-2">{s.pickup_location}</td>
                <td className="px-4 py-2">{s.delivery_location}</td>
                <td className="px-4 py-2 capitalize">{s.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No shipments found.</p>
      )}
    </div>
  );
}

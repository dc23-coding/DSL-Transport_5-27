// src/components/pages/DriverDashboard.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Truck, Calendar, Clock } from 'lucide-react';

export default function DriverDashboard() {
  const { user } = useAuth();
  const [loads, setLoads] = useState([]);
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    async function fetchDriverData() {
      const { data: allLoads, error } = await supabase
        .from('loads')
        .select('id, pickup_location, delivery_location, pickup_date, status')
        .eq('driver_id', user.id)
        .order('pickup_date', { ascending: true });
      if (!error && allLoads) {
        setLoads(allLoads);
        setUpcomingCount(allLoads.filter(l => l.status === 'pending').length);
        setCompletedCount(allLoads.filter(l => l.status === 'delivered').length);
      }
    }
    fetchDriverData();
  }, [user.id]);

  return (
    <motion.div
      className="p-6 max-w-4xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h1
        className="text-3xl font-bold mb-4"
        initial={{ y: -10 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        Driver Dashboard
      </motion.h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-card p-4 rounded shadow-sm text-center">
          <Truck className="mx-auto h-6 w-6 text-primary mb-2" />
          <h3 className="text-lg font-semibold">My Loads</h3>
          <p className="text-2xl mt-1">{loads.length}</p>
        </div>
        <div className="bg-card p-4 rounded shadow-sm text-center">
          <Calendar className="mx-auto h-6 w-6 text-primary mb-2" />
          <h3 className="text-lg font-semibold">Upcoming</h3>
          <p className="text-2xl mt-1">{upcomingCount}</p>
        </div>
        <div className="bg-card p-4 rounded shadow-sm text-center">
          <Clock className="mx-auto h-6 w-6 text-primary mb-2" />
          <h3 className="text-lg font-semibold">Completed</h3>
          <p className="text-2xl mt-1">{completedCount}</p>
        </div>
      </div>

      <section className="bg-card p-4 rounded shadow-sm">
        <h2 className="text-2xl font-semibold mb-2">Assigned Loads</h2>
        {loads.length ? (
          <ul className="divide-y">
            {loads.map(load => (
              <li key={load.id} className="py-3 flex justify-between">
                <span>
                  {load.pickup_location} → {load.delivery_location}
                </span>
                <span className="text-sm text-muted-foreground">
                  {new Date(load.pickup_date).toLocaleDateString()} • {load.status}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No loads assigned.</p>
        )}
      </section>
    </motion.div>
  );
}

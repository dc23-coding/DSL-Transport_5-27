
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, DollarSign, TrendingUp, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const BrokerDashboard = () => {
  const { user } = useAuth();
  const [shipments, setShipments] = useState([]);
  const [stats, setStats] = useState({
    totalShipments: 0,
    activeShipments: 0,
    totalRevenue: 0,
    monthlyGrowth: 0
  });

  useEffect(() => {
    const fetchBrokerData = async () => {
      const { data: shipmentsData } = await supabase
        .from('shipments')
        .select('*')
        .order('created_at', { ascending: false });

      if (shipmentsData) {
        setShipments(shipmentsData);
        
        // Calculate stats
        const totalRevenue = shipmentsData.reduce((sum, shipment) => sum + 1000, 0); // Example revenue calculation
        const activeShipments = shipmentsData.filter(s => s.status === 'In Transit').length;
        
        setStats({
          totalShipments: shipmentsData.length,
          activeShipments,
          totalRevenue,
          monthlyGrowth: 12 // Example growth percentage
        });
      }
    };

    fetchBrokerData();
  }, [user.id]);

  // Example revenue data for the chart
  const revenueData = import.meta.env.VITE_USE_MOCK_DATA === 'true' ? [
    { month: 'Jan', revenue: 45000 },
    { month: 'Feb', revenue: 52000 },
    { month: 'Mar', revenue: 48000 },
    { month: 'Apr', revenue: 61000 },
    { month: 'May', revenue: 55000 },
    { month: 'Jun', revenue: 67000 }
  ]: [];
const totalRevenue = shipmentsData ? shipmentsData.reduce((sum, shipment) => sum + (shipment.revenue || 0), 0) : 0;
const monthlyGrowth = shipmentsData ? calculateGrowth(shipmentsData) : 0;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold">Broker Dashboard</h1>
        <p className="text-muted-foreground mt-2">Manage your shipments and track revenue</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          className="glass-effect p-4 rounded-lg"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-400" />
            <h3 className="font-medium">Total Shipments</h3>
          </div>
          <p className="text-2xl font-bold mt-2">{stats.totalShipments}</p>
        </motion.div>

        <motion.div
          className="glass-effect p-4 rounded-lg"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-400" />
            <h3 className="font-medium">Total Revenue</h3>
          </div>
          <p className="text-2xl font-bold mt-2">${stats.totalRevenue.toLocaleString()}</p>
        </motion.div>

        <motion.div
          className="glass-effect p-4 rounded-lg"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-yellow-400" />
            <h3 className="font-medium">Active Shipments</h3>
          </div>
          <p className="text-2xl font-bold mt-2">{stats.activeShipments}</p>
        </motion.div>

        <motion.div
          className="glass-effect p-4 rounded-lg"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-400" />
            <h3 className="font-medium">Monthly Growth</h3>
          </div>
          <p className="text-2xl font-bold mt-2">+{stats.monthlyGrowth}%</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          className="glass-effect p-4 rounded-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-xl font-bold mb-4">Revenue Trend</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#4CAF50" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          className="glass-effect p-4 rounded-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-xl font-bold mb-4">Recent Shipments</h3>
          <div className="space-y-4">
            {shipments.slice(0, 5).map(shipment => (
              <div key={shipment.id} className="gradient-border bg-card p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{shipment.customer}</p>
                    <p className="text-sm text-muted-foreground">
                      {shipment.origin} → {shipment.destination}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${
                      shipment.status === 'In Transit' ? 'bg-blue-500' :
                      shipment.status === 'Completed' ? 'bg-green-500' :
                      'bg-yellow-500'
                    }`} />
                    <span className="text-sm">{shipment.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BrokerDashboard;

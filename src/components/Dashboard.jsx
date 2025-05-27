
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, Calendar, DollarSign, Users, PackageCheck, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import LoadForm from '@/components/forms/LoadForm';
import ShipmentForm from '@/components/forms/ShipmentForm';
import PayrollForm from '@/components/forms/PayrollForm';
import DriverForm from '@/components/forms/DriverForm';
import DispatchingColumn from '@/components/columns/DispatchingColumn';
import LogisticsColumn from '@/components/columns/LogisticsColumn';
import PayrollColumn from '@/components/columns/PayrollColumn';


const Dashboard = () => {
  const [activeColumns, setActiveColumns] = useState([]);
  const [showLoadForm, setShowLoadForm] = useState(false);
  const [showShipmentForm, setShowShipmentForm] = useState(false);
  const [showPayrollForm, setShowPayrollForm] = useState(false);
  const [showDriverForm, setShowDriverForm] = useState(false);
  const { toast } = useToast();
  const [statsData, setStatsData] = useState([
    { icon: <Truck className="h-5 w-5 text-blue-400" />, title: "Active Trucks", value: "0", change: "" },
    { icon: <Calendar className="h-5 w-5 text-green-400" />, title: "Scheduled Loads", value: "0", change: "" },
    { icon: <DollarSign className="h-5 w-5 text-yellow-400" />, title: "Revenue MTD", value: "$0", change: "" },
    { icon: <Users className="h-5 w-5 text-purple-400" />, title: "Total Drivers", value: "0", change: "" },
  ]);

  const fetchDashboardStats = useCallback(async () => {
    try {
      const { count: activeTrucksCount, error: trucksError } = await supabase
        .from('vehicles')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'in_use');
      if (trucksError) {
        console.error("Error fetching active trucks count:", trucksError);
        if (trucksError.code !== '42P01') toast({ title: "Error fetching active trucks", description: trucksError.message, variant: "destructive" });
      }

      const { count: scheduledLoadsCount, error: loadsError } = await supabase
        .from('loads')
        .select('id', { count: 'exact', head: true })
        .in('status', ['Scheduled', 'Picked Up']);
      if (loadsError) {
        console.error("Error fetching scheduled loads count:", loadsError);
        if (loadsError.code !== '42P01') toast({ title: "Error fetching scheduled loads", description: loadsError.message, variant: "destructive" });
      }
      
      const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const currentMonthEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59, 999).toISOString();

      const { data: revenueData, error: revenueError } = await supabase
        .from('payroll')
        .select('amount')
        .gte('payment_date', currentMonthStart)
        .lte('payment_date', currentMonthEnd);
      if (revenueError) {
        console.error("Error fetching revenue data:", revenueError);
        if (revenueError.code !== '42P01') toast({ title: "Error fetching revenue", description: revenueError.message, variant: "destructive" });
      }
        
      const totalRevenueMTD = revenueData ? revenueData.reduce((sum, item) => sum + Number(item.amount), 0) : 0;

      const { count: driversCount, error: driversError } = await supabase
        .from('drivers')
        .select('id', { count: 'exact', head: true });
      if (driversError) {
        console.error("Error fetching drivers count:", driversError);
        if (driversError.code !== '42P01') toast({ title: "Error fetching total drivers", description: driversError.message, variant: "destructive" });
      }

      setStatsData([
        { ...statsData[0], value: activeTrucksCount?.toString() ?? "0" },
        { ...statsData[1], value: scheduledLoadsCount?.toString() ?? "0" },
        { ...statsData[2], value: `$${totalRevenueMTD.toLocaleString()}` },
        { ...statsData[3], value: driversCount?.toString() ?? "0" },
      ]);

    } catch (error) {
      console.error('Generic error in fetchDashboardStats:', error);
      toast({ title: "Failed to load dashboard statistics", description: "An unexpected error occurred.", variant: "destructive" });
    }
  }, [toast]); // Removed statsData from dependencies as it causes re-fetch loop

  useEffect(() => {
    fetchDashboardStats();
    const timers = [
      setTimeout(() => setActiveColumns(prev => [...prev, 'dispatching']), 300),
      setTimeout(() => setActiveColumns(prev => [...prev, 'logistics']), 600),
      setTimeout(() => setActiveColumns(prev => [...prev, 'payroll']), 900),
    ];
    return () => timers.forEach(clearTimeout);
  }, [fetchDashboardStats]);

  const handleSuccess = (type) => {
    toast({ title: `${type} operation successful!` });
    fetchDashboardStats(); 
  };

  return (
    <div className="space-y-6 pb-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your trucking operations.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }} className="flex flex-wrap gap-3 mb-6 p-4 glass-effect rounded-lg shadow-md">
        <Button onClick={() => setShowLoadForm(true)} className="flex-grow sm:flex-grow-0"><PlusCircle className="mr-2 h-4 w-4" /> New Load</Button>
        <Button onClick={() => setShowShipmentForm(true)} className="flex-grow sm:flex-grow-0"><PackageCheck className="mr-2 h-4 w-4" /> New Shipment</Button>
        <Button onClick={() => setShowPayrollForm(true)} className="flex-grow sm:flex-grow-0"><DollarSign className="mr-2 h-4 w-4" /> New Payment</Button>
        <Button onClick={() => setShowDriverForm(true)} className="flex-grow sm:flex-grow-0"><Users className="mr-2 h-4 w-4" /> Add Driver</Button>
      </motion.div>

      <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}>
        {statsData.map((stat, index) => (
          <motion.div
            key={stat.title}
            className="glass-effect rounded-lg p-4 shadow-md"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 * index + 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div className="rounded-full bg-background/30 p-2">{stat.icon}</div>
              {stat.change && (
                <div className={`flex items-center text-sm ${stat.change.startsWith('+') ? 'text-green-400' : stat.change === '0' || stat.change === '' ? 'text-gray-400' : 'text-red-400'}`}>
                  {stat.change}
                </div>
              )}
            </div>
            <div className="mt-3">
              <p className="text-sm text-muted-foreground">{stat.title}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-4">
        {activeColumns.includes('dispatching') && (
          <motion.div className="flex-1 min-w-0 lg:max-w-[calc(100%/3-1rem)]" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
            <DispatchingColumn onOpenLoadForm={() => setShowLoadForm(true)} />
          </motion.div>
        )}
        {activeColumns.includes('logistics') && (
          <motion.div className="flex-1 min-w-0 lg:max-w-[calc(100%/3-1rem)]" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
            <LogisticsColumn onOpenShipmentForm={() => setShowShipmentForm(true)} />
          </motion.div>
        )}
        {activeColumns.includes('payroll') && (
          <motion.div className="flex-1 min-w-0 lg:max-w-[calc(100%/3-1rem)]" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
            <PayrollColumn onOpenPayrollForm={() => setShowPayrollForm(true)} />
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {showLoadForm && <LoadForm onClose={() => setShowLoadForm(false)} onSuccess={() => { handleSuccess('Load'); setShowLoadForm(false); }} />}
        {showShipmentForm && <ShipmentForm onClose={() => setShowShipmentForm(false)} onSuccess={() => { handleSuccess('Shipment'); setShowShipmentForm(false); }} />}
        {showPayrollForm && <PayrollForm onClose={() => setShowPayrollForm(false)} onSuccess={() => { handleSuccess('Payroll'); setShowPayrollForm(false); }} />}
        {showDriverForm && <DriverForm onClose={() => setShowDriverForm(false)} onSuccess={() => { handleSuccess('Driver'); setShowDriverForm(false); }} />}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;

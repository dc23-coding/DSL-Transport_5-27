// src/components/dashboards/driver/DriverDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import DriverDashboardContent from '@/components/dashboards/driver/DriverDashboardContent';

const DriverDashboard = () => {
  const { user, adminMode } = useAuth();
  const { toast } = useToast();
  const [loads, setLoads] = useState([]);
  const [payments, setPayments] = useState([]);
  const [driverDetails, setDriverDetails] = useState(null);
  const [stats, setStats] = useState({
    completedLoads: 0,
    totalEarnings: 0,
    upcomingLoads: 0,
    complianceAlerts: []
  });
  const [loadingData, setLoadingData] = useState(true);
  const [selectedLoad, setSelectedLoad] = useState(null);

  const fetchDriverData = useCallback(async () => {
    setLoadingData(true);

    // If Supabase isn’t set up yet
    if (!supabase?.auth) {
      toast({
        title: 'Supabase Not Integrated',
        description: 'Cannot fetch live driver data. Please complete Supabase integration.',
        variant: 'destructive'
      });
      setDriverDetails({
        full_name: adminMode ? 'Admin (Test View - No DB)' : (user?.email?.split('@')[0] || 'Driver (No DB)'),
        email: adminMode ? 'admin@example.com' : user?.email
      });
      setLoads([]);
      setPayments([]);
      setStats({ completedLoads: 0, totalEarnings: 0, upcomingLoads: 0, complianceAlerts: [] });
      setLoadingData(false);
      return;
    }

    // If not logged in (and not in admin test view)
    if (!user && !adminMode) {
      toast({
        title: 'Authentication Error',
        description: 'User not found. Cannot fetch driver data.',
        variant: 'destructive'
      });
      setLoadingData(false);
      return;
    }

    let driverId = user?.id;

    // Admin mode: grab the first active driver for testing
    if (adminMode) {
      const { data: firstDriver, error } = await supabase
        .from('drivers')
        .select('id, full_name, email')
        .eq('status', 'active')
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error || !firstDriver) {
        toast({
          title: 'Admin View Info',
          description: 'No active driver found for admin view.',
          variant: error ? 'destructive' : 'default'
        });
        setDriverDetails({ full_name: 'Admin (Test View)', email: 'admin@example.com' });
        setLoads([]);
        setPayments([]);
        setStats(prev => ({ ...prev, completedLoads: 0, totalEarnings: 0, upcomingLoads: 0, complianceAlerts: [] }));
        setLoadingData(false);
        return;
      }

      driverId = firstDriver.id;
      setDriverDetails(firstDriver);
    }
    // Regular driver: fetch own profile
    else {
      const { data: currentDriver, error } = await supabase
        .from('drivers')
        .select('id, full_name, email')
        .eq('id', driverId)
        .maybeSingle();

      if (error) {
        toast({ title: 'Driver Profile Error', description: error.message, variant: 'destructive' });
        setDriverDetails({ full_name: user.email.split('@')[0], email: user.email });
      } else if (currentDriver) {
        setDriverDetails(currentDriver);
      } else {
        toast({
          title: 'Driver Profile Not Found',
          description: 'Could not find a driver profile for this user.',
          variant: 'warning'
        });
        setDriverDetails({ full_name: user.email.split('@')[0], email: user.email });
      }
    }

    if (!driverId) {
      setLoadingData(false);
      return;
    }

    // Fetch loads (array)
    const { data: loadsData, error: loadsError } = await supabase
      .from('loads')
      .select('*')
      .eq('driver_id', driverId)
      .order('pickup_time', { ascending: true });

    if (loadsError) {
      toast({ title: 'Error fetching loads', description: loadsError.message, variant: 'destructive' });
    }

    // Fetch payroll (array)
    const { data: paymentsData, error: paymentsError } = await supabase
      .from('payroll')
      .select('*')
      .eq('driver_id', driverId)
      .order('payment_date', { ascending: false });

    if (paymentsError) {
      toast({ title: 'Error fetching payments', description: paymentsError.message, variant: 'destructive' });
    }

    setLoads(loadsData || []);
    setPayments(paymentsData || []);

    setStats({
      completedLoads: (loadsData || []).filter(l => l.status === 'Completed').length,
      totalEarnings: (paymentsData || []).reduce((sum, p) => sum + Number(p.amount), 0),
      upcomingLoads: (loadsData || []).filter(l =>
        ['Scheduled', 'Picked Up', 'In Transit', 'At Delivery'].includes(l.status)
      ).length,
      complianceAlerts: []
    });

    setLoadingData(false);
  }, [user, adminMode, toast]);

  useEffect(() => {
    if (user || adminMode) fetchDriverData();
  }, [fetchDriverData, user, adminMode]);

  const handleUpdateLoadStatus = updatedLoad => {
    setLoads(prev => prev.map(l => (l.id === updatedLoad.id ? updatedLoad : l)));
    fetchDriverData();
  };

  if (loadingData) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-var(--header-height,4rem))]">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <DriverDashboardContent
      driverDetails={driverDetails}
      user={user}
      adminMode={adminMode}
      stats={stats}
      payments={payments}
      loads={loads}
      selectedLoad={selectedLoad}
      setSelectedLoad={setSelectedLoad}
      handleUpdateLoadStatus={handleUpdateLoadStatus}
    />
  );
};

export default DriverDashboard;

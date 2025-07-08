
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DriverStats from '@/components/dashboards/driver/DriverStats';
import DriverEarningsChart from '@/components/dashboards/driver/DriverEarningsChart';
import DriverUpcomingLoads from '@/components/dashboards/driver/DriverUpcomingLoads';
import DriverPaymentHistory from '@/components/dashboards/driver/DriverPaymentHistory';
import LoadDetailsModal from '@/components/dashboards/driver/LoadDetailsModal';
import { AlertTriangle } from 'lucide-react';

const DriverDashboardContent = ({
  driverDetails,
  user,
  adminMode,
  stats,
  payments,
  loads,
  selectedLoad,
  setSelectedLoad,
  handleUpdateLoadStatus
}) => {
  const driverNameToDisplay = driverDetails?.full_name || (user?.email ? user.email.split('@')[0] : 'Driver');
  const welcomeMessage = adminMode && driverDetails ? `Viewing data for ${driverDetails.full_name}` : `Welcome back, ${driverNameToDisplay}!`;

  const mockLoads = import.meta.env.VITE_USE_MOCK_DATA === 'true' ? [
  { id: '1', driver_id: user?.id || 'mock-id', status: 'Scheduled', pickup_time: '2025-07-07T10:00:00Z', origin: 'New York', destination: 'Chicago', delivery_time: '2025-07-08T10:00:00Z' }
] : [];
const mockPayments = import.meta.env.VITE_USE_MOCK_DATA === 'true' ? [
  { id: '1', driver_id: user?.id || 'mock-id', amount: 500, payment_date: '2025-07-06', period_start: '2025-07-01', period_end: '2025-07-06', status: 'Paid' }
] : [];

const fetchDriverData = useCallback(async () => {
  setLoadingData(true);
  if (!supabase?.auth) {
    setDriverDetails({
      full_name: adminMode ? 'Admin (Test View - No DB)' : (user?.email?.split('@')[0] || 'Driver (No DB)'),
      email: adminMode ? 'admin@example.com' : user?.email
    });
    setLoads(mockLoads);
    setPayments(mockPayments);
    setStats({
      completedLoads: mockLoads.filter(l => l.status === 'Completed').length,
      totalEarnings: mockPayments.reduce((sum, p) => sum + Number(p.amount), 0),
      upcomingLoads: mockLoads.filter(l => ['Scheduled', 'Picked Up', 'In Transit', 'At Delivery'].includes(l.status)).length,
      complianceAlerts: []
    });
    setLoadingData(false);
    return;
  }
  // Rest of the fetchDriverData function
}, [user, adminMode, toast]);

  return (
    <div className="space-y-6 pb-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-bold">Driver Dashboard</h1>
        <p className="text-muted-foreground mt-2">{welcomeMessage} Here's your overview.</p>
      </motion.div>

      <DriverStats stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DriverEarningsChart payments={payments} />
        <DriverUpcomingLoads loads={loads} onSelectLoad={setSelectedLoad} />
      </div>
      
      <DriverPaymentHistory payments={payments} />

      {stats.complianceAlerts && stats.complianceAlerts.length > 0 && (
         <motion.div className="glass-effect p-4 rounded-lg shadow-lg" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><AlertTriangle className="text-red-400"/>Compliance Alerts</h3>
          <div className="space-y-2">
            {stats.complianceAlerts.map(alert => (
              <div key={alert.id} className={`p-3 rounded-md ${alert.severity === 'warning' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-red-500/20 text-red-300'}`}>
                {alert.message}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {selectedLoad && (
          <LoadDetailsModal 
            load={selectedLoad} 
            onClose={() => setSelectedLoad(null)}
            onUpdateStatus={handleUpdateLoadStatus}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default DriverDashboardContent;

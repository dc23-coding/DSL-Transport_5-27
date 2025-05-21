
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, DollarSign, Truck, AlertTriangle } from 'lucide-react';

const DriverStats = ({ stats }) => {
  const statItems = [
    { title: "Completed Loads", value: stats.completedLoads, icon: <CheckCircle className="h-5 w-5 text-green-400" />, delay:0.1 },
    { title: "Total Earnings", value: `$${stats.totalEarnings.toFixed(2)}`, icon: <DollarSign className="h-5 w-5 text-yellow-400" />, delay:0.2 },
    { title: "Upcoming Loads", value: stats.upcomingLoads, icon: <Truck className="h-5 w-5 text-blue-400" />, delay:0.3 },
    { title: "Compliance Alerts", value: stats.complianceAlerts.length, icon: <AlertTriangle className="h-5 w-5 text-red-400" />, delay:0.4 }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map(stat => (
        <motion.div
          key={stat.title}
          className="glass-effect p-4 rounded-lg shadow-lg"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: stat.delay }}
        >
          <div className="flex items-center gap-2">
            {stat.icon}
            <h3 className="font-medium">{stat.title}</h3>
          </div>
          <p className="text-2xl font-bold mt-2">{stat.value}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default DriverStats;

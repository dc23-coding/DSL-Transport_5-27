
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CalendarDays, Edit3 } from 'lucide-react';

const DriverUpcomingLoads = ({ loads, onSelectLoad }) => {
  const upcomingLoads = loads.filter(load => ['Scheduled', 'Picked Up', 'In Transit', 'At Delivery'].includes(load.status));
  return (
    <motion.div
      className="glass-effect p-4 rounded-lg shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      <h3 className="text-xl font-bold mb-4">Upcoming & Active Loads</h3>
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
        {upcomingLoads.length > 0 ? 
          upcomingLoads.map(load => (
            <div key={load.id} className="gradient-border bg-card/80 p-3 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium truncate max-w-[180px]">{load.origin} → {load.destination}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <CalendarDays className="h-3 w-3"/> {new Date(load.pickup_time).toLocaleDateString()}
                  </p>
                </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    load.status === 'Scheduled' ? 'bg-blue-500/20 text-blue-300' :
                    load.status === 'Picked Up' ? 'bg-teal-500/20 text-teal-300' :
                    load.status === 'In Transit' ? 'bg-sky-500/20 text-sky-300' :
                    load.status === 'At Delivery' ? 'bg-indigo-500/20 text-indigo-300' :
                    'bg-yellow-500/20 text-yellow-300'
                  }`}>
                    {load.status}
                  </span>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-2 text-xs" onClick={() => onSelectLoad(load)}>
                <Edit3 className="h-3 w-3 mr-1" /> View & Update Status
              </Button>
            </div>
          )) : (
            <p className="text-muted-foreground text-center pt-10">No upcoming or active loads assigned.</p>
          )}
      </div>
    </motion.div>
  );
};

export default DriverUpcomingLoads;

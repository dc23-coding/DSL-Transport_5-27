// src/components/columns/DispatchingColumn.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Truck, MapPin, Clock, Calendar, Plus, MoreHorizontal, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import LoadForm from '@/components/forms/LoadForm';

const DispatchingColumn = () => {
  const [loads, setLoads] = useState([]);
  const [filteredLoads, setFilteredLoads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoadForm, setShowLoadForm] = useState(false);
  const [filter, setFilter] = useState('All Loads');
  const [activeLoad, setActiveLoad] = useState(null);
  const { toast } = useToast();

  // 🔄 Fetch Loads from Supabase
  const fetchLoads = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('loads').select('*');
    if (error) {
      toast({ title: 'Error fetching loads', description: error.message, variant: 'destructive' });
      console.error(error);
    }
    const fetchedData = data && data.length > 0 ? data : fallbackData;
    setLoads(fetchedData);
    applyFilter(fetchedData, filter);
    setLoading(false);
  }, [toast, filter]);

  // 🏃 Initial Fetch on Mount
  useEffect(() => {
    fetchLoads();
  }, [fetchLoads]);

  // 🛠️ Fallback Static Data
  const fallbackData = [
    {
      id: 1,
      driver: 'Michael Johnson',
      origin: 'Chicago, IL',
      destination: 'Indianapolis, IN',
      pickup_time: '09:30 AM',
      status: 'In Transit',
      statusColor: 'bg-blue-500'
    },
    {
      id: 2,
      driver: 'Sarah Williams',
      origin: 'Detroit, MI',
      destination: 'Cleveland, OH',
      pickup_time: '11:00 AM',
      status: 'Scheduled',
      statusColor: 'bg-purple-500'
    }
  ];

  // 🧠 Apply Status Filter
  const applyFilter = (data, filterValue) => {
    if (filterValue === 'All Loads') {
      setFilteredLoads(data);
    } else {
      setFilteredLoads(data.filter(load => load.status === filterValue));
    }
  };

  // 🏃 Re-apply Filter on Filter Change
  useEffect(() => {
    applyFilter(loads, filter);
  }, [filter, loads]);

  // 🎨 Animation Variants
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: i => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.3 }
    })
  };

  return (
    <div className="h-full flex flex-col glass-effect rounded-lg p-4 shadow-lg">
      
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">Dispatching</h2>
        </div>
        <Button size="sm" className="gap-1" onClick={() => setShowLoadForm(true)}>
          <Plus className="h-4 w-4" />
          <span>New Load</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4">
        {['All Loads', 'In Transit', 'Scheduled', 'Completed'].map(status => (
          <Button
            key={status}
            variant={filter === status ? 'default' : 'ghost'}
            size="sm"
            className="text-xs"
            onClick={() => setFilter(status)}
          >
            {status}
          </Button>
        ))}
        <Button variant="ghost" size="sm" className="gap-1">
          <Filter className="h-3 w-3" />
          <span className="text-xs">Filter</span>
        </Button>
      </div>

      {/* Load List */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : (
          filteredLoads.map((item, i) => (
            <motion.div
              key={item.id}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={itemVariants}
              className="gradient-border bg-card p-3 rounded-lg"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium">{item.driver || 'Unassigned'}</h3>
                <div className="flex items-center gap-1">
                  <div className={`h-2 w-2 rounded-full ${item.status === 'Scheduled' ? 'bg-purple-500' : item.status === 'In Transit' ? 'bg-blue-500' : 'bg-yellow-500'}`} />
                  <span className="text-xs text-muted-foreground">{item.status}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span className="truncate">{item.origin}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span className="truncate">{item.destination}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span>{item.pickup_time || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span>{new Date(item.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="mt-3 flex justify-between items-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 px-2"
                  onClick={() => setActiveLoad(item)}
                >
                  View Details
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Load Form Modal */}
      {showLoadForm && (
        <LoadForm onClose={() => setShowLoadForm(false)} onSuccess={fetchLoads} />
      )}

      {/* View Details Modal */}
      {activeLoad && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Load Details</h2>
              <Button variant="ghost" size="icon" onClick={() => setActiveLoad(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2 text-sm">
              <p><strong>Driver:</strong> {activeLoad.driver || 'Unassigned'}</p>
              <p><strong>Origin:</strong> {activeLoad.origin}</p>
              <p><strong>Destination:</strong> {activeLoad.destination}</p>
              <p><strong>Pickup Time:</strong> {activeLoad.pickup_time || 'N/A'}</p>
              <p><strong>Status:</strong> {activeLoad.status}</p>
              <p><strong>Created:</strong> {new Date(activeLoad.created_at).toLocaleString()}</p>
            </div>
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={() => setActiveLoad(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DispatchingColumn;

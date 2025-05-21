// src/components/columns/LogisticsColumn.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Package, MapPin, Truck, Calendar, Plus, MoreHorizontal, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import ShipmentForm from '@/components/forms/ShipmentForm';

const LogisticsColumn = () => {
  const [shipments, setShipments] = useState([]);
  const [filteredShipments, setFilteredShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showShipmentForm, setShowShipmentForm] = useState(false);
  const [filter, setFilter] = useState('All Shipments');
  const [activeShipment, setActiveShipment] = useState(null);
  const { toast } = useToast();

  // 🔄 Fetch Shipments from Supabase
  const fetchShipments = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('shipments').select('*');
    if (error) {
      toast({ title: 'Error fetching shipments', description: error.message, variant: 'destructive' });
      console.error(error);
    }
    const fetchedData = data && data.length > 0 ? data : fallbackData;
    setShipments(fetchedData);
    applyFilter(fetchedData, filter);
    setLoading(false);
  }, [toast, filter]);

  // 🏃 Initial Fetch on Mount
  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  // 🛠️ Fallback Static Data
  const fallbackData = [
    {
      id: 1,
      customer: 'ABC Manufacturing',
      cargo_type: 'Industrial Equipment',
      weight: '12500',
      origin: 'Detroit, MI',
      destination: 'Columbus, OH',
      status: 'In Transit',
      statusColor: 'bg-blue-500'
    },
    {
      id: 2,
      customer: 'XYZ Distribution',
      cargo_type: 'Consumer Goods',
      weight: '8200',
      origin: 'Chicago, IL',
      destination: 'St. Louis, MO',
      status: 'Scheduled',
      statusColor: 'bg-purple-500'
    }
  ];

  // 🧠 Apply Status Filter
  const applyFilter = (data, filterValue) => {
    if (filterValue === 'All Shipments') {
      setFilteredShipments(data);
    } else {
      setFilteredShipments(data.filter(shipment => shipment.status === filterValue));
    }
  };

  // 🏃 Re-apply Filter on Filter Change
  useEffect(() => {
    applyFilter(shipments, filter);
  }, [filter, shipments]);

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
          <Package className="h-5 w-5 text-green-400" />
          <h2 className="text-xl font-bold">Logistics</h2>
        </div>
        <Button size="sm" className="gap-1" onClick={() => setShowShipmentForm(true)}>
          <Plus className="h-4 w-4" />
          <span>New Shipment</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {['All Shipments', 'In Transit', 'Scheduled'].map(status => (
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
        </div>
        <Button variant="ghost" size="sm" className="gap-1">
          <Filter className="h-3 w-3" />
          <span className="text-xs">Filter</span>
        </Button>
      </div>

      {/* Shipment List */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : (
          filteredShipments.map((item, i) => (
            <motion.div
              key={item.id}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={itemVariants}
              className="gradient-border bg-card p-3 rounded-lg"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium">{item.customer}</h3>
                <div className="flex items-center gap-1">
                  <div className={`h-2 w-2 rounded-full ${item.status === 'Scheduled' ? 'bg-purple-500' : item.status === 'In Transit' ? 'bg-blue-500' : 'bg-yellow-500'}`} />
                  <span className="text-xs text-muted-foreground">{item.status}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <Package className="h-3 w-3 text-muted-foreground" />
                  <span className="truncate">{item.cargo_type}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Truck className="h-3 w-3 text-muted-foreground" />
                  <span>{item.weight} lbs</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span className="truncate">{item.origin}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span className="truncate">{item.destination}</span>
                </div>
              </div>

              <div className="mt-3 flex justify-between items-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 px-2"
                  onClick={() => setActiveShipment(item)}
                >
                  Track Shipment
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Shipment Form Modal */}
      {showShipmentForm && (
        <ShipmentForm onClose={() => setShowShipmentForm(false)} onSuccess={fetchShipments} />
      )}

      {/* Track Shipment Modal */}
      {activeShipment && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Shipment Details</h2>
              <Button variant="ghost" size="icon" onClick={() => setActiveShipment(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2 text-sm">
              <p><strong>Customer:</strong> {activeShipment.customer}</p>
              <p><strong>Cargo:</strong> {activeShipment.cargo_type}</p>
              <p><strong>Weight:</strong> {activeShipment.weight} lbs</p>
              <p><strong>Origin:</strong> {activeShipment.origin}</p>
              <p><strong>Destination:</strong> {activeShipment.destination}</p>
              <p><strong>Status:</strong> {activeShipment.status}</p>
            </div>
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={() => setActiveShipment(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogisticsColumn;

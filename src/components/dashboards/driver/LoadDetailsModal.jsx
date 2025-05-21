
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

const LoadDetailsModal = ({ load, onClose, onUpdateStatus }) => {
  const [newStatus, setNewStatus] = useState(load.status);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleStatusUpdate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('loads')
        .update({ status: newStatus })
        .eq('id', load.id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Load status updated!",
        description: `Load status changed to ${newStatus}.`,
      });
      onUpdateStatus(data);
      onClose();
    } catch (error) {
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const availableStatuses = ["Scheduled", "Picked Up", "In Transit", "At Delivery", "Delivered", "Completed", "Cancelled", "Problem"];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-card p-6 rounded-lg shadow-xl max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Load Details</h2>
            <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>
        
        <p className="text-sm text-muted-foreground mb-2">ID: {load.id.substring(0, 8)}</p>
        <div className="space-y-3 text-sm mb-6">
          <p><strong>Origin:</strong> {load.origin}</p>
          <p><strong>Destination:</strong> {load.destination}</p>
          <p><strong>Pickup Time:</strong> {new Date(load.pickup_time).toLocaleString()}</p>
          <p><strong>Delivery Time:</strong> {new Date(load.delivery_time).toLocaleString()}</p>
          <p><strong>Current Status:</strong> <span className="font-semibold">{load.status}</span></p>
        </div>
        
        <div className="mt-6">
          <label htmlFor="status" className="block text-sm font-medium mb-1">Update Status:</label>
          <select
            id="status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="w-full px-3 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary mb-4"
          >
            {availableStatuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <Button onClick={handleStatusUpdate} disabled={loading || newStatus === load.status} className="w-full">
            {loading ? 'Updating...' : 'Update Status'}
          </Button>
        </div>

        <Button variant="outline" onClick={onClose} className="w-full mt-3">
          Close
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default LoadDetailsModal;

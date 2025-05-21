// src/components/forms/PayrollForm.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

const PayrollForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    driver_id: '',
    amount: '',
    period_start: '',
    period_end: '',
    payment_date: '',
    status: 'Processing',
  });
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // 1) Fetch drivers with full_name, not `name`
  useEffect(() => {
    const fetchDrivers = async () => {
      const { data, error } = await supabase
        .from('drivers')
        .select('id, full_name')
        .order('full_name', { ascending: true });
      if (error) {
        toast({ title: 'Error loading drivers', description: error.message, variant: 'destructive' });
      } else {
        setDrivers(data);
      }
    };
    fetchDrivers();
  }, [toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 2) Insert the payment
      const { data, error } = await supabase
        .from('payroll')
        .insert([formData])
        .select();

      if (error) throw error;

      toast({
        title: 'Payment created successfully',
        description: `Payment for driver added.`,
      });

      onSuccess && onSuccess(data[0]);
      onClose();
    } catch (error) {
      toast({
        title: 'Error creating payment',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <div className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create New Payment</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Driver select */}
          <div>
            <label className="block text-sm font-medium mb-1">Driver</label>
            <select
              value={formData.driver_id}
              onChange={(e) => setFormData({ ...formData, driver_id: e.target.value })}
              className="w-full px-3 py-2 rounded-md border bg-background"
              required
            >
              <option value="">Select Driver</option>
              {drivers.map((drv) => (
                <option key={drv.id} value={drv.id}>
                  {drv.full_name}
                </option>
              ))}
            </select>
            {/* Link out to your Driver Management page */}
            <Button
              variant="link"
              size="sm"
              className="mt-2 px-0"
              onClick={() => navigate('/driver-management')}
            >
              + Add New Driver
            </Button>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium mb-1">Amount ($)</label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-3 py-2 rounded-md border bg-background"
              required
            />
          </div>

          {/* Period Start */}
          <div>
            <label className="block text-sm font-medium mb-1">Period Start</label>
            <input
              type="date"
              value={formData.period_start}
              onChange={(e) => setFormData({ ...formData, period_start: e.target.value })}
              className="w-full px-3 py-2 rounded-md border bg-background"
              required
            />
          </div>

          {/* Period End */}
          <div>
            <label className="block text-sm font-medium mb-1">Period End</label>
            <input
              type="date"
              value={formData.period_end}
              onChange={(e) => setFormData({ ...formData, period_end: e.target.value })}
              className="w-full px-3 py-2 rounded-md border bg-background"
              required
            />
          </div>

          {/* Payment Date */}
          <div>
            <label className="block text-sm font-medium mb-1">Payment Date</label>
            <input
              type="date"
              value={formData.payment_date}
              onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
              className="w-full px-3 py-2 rounded-md border bg-background"
              required
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Payment'}
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default PayrollForm;


import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

const DriverForm = ({ onClose, onSuccess, driver }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    license_number: '',
    city: '',
    state: '',
    status: 'active' // Default status for new drivers
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const isEditing = !!driver;

  useEffect(() => {
    if (isEditing && driver) {
      setFormData({
        full_name: driver.full_name || '',
        email: driver.email || '',
        phone_number: driver.phone_number || '',
        license_number: driver.license_number || '',
        city: driver.city || '',
        state: driver.state || '',
        status: driver.status || 'active'
      });
    }
  }, [driver, isEditing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let responseData, error;
      const submissionData = { ...formData, updated_at: new Date().toISOString() };

      if (isEditing) {
        // Editing an existing driver profile in 'drivers' table
        ({ data: responseData, error } = await supabase
          .from('drivers')
          .update(submissionData)
          .eq('id', driver.id) // Assuming 'id' is the primary key of 'drivers' table
          .select()
          .single());
      } else {
        // Adding a new driver. This might involve creating an auth user first
        // or assuming an auth user (user_id) is provided/handled elsewhere.
        // For simplicity, this form primarily deals with the 'drivers' profile.
        // If creating a new driver from scratch including auth, a more complex flow is needed.
        // Here, we assume we are adding a profile to the 'drivers' table.
        // If 'user_id' is required and not derived from an auth user, it needs to be handled.
        
        // Check if driver with this email already exists in auth.users
        // This part is complex because DriverForm might be used to add a driver that isn't an auth.user yet,
        // or one that IS an auth.user but doesn't have a drivers profile.
        // For now, we'll focus on creating/updating the 'drivers' table entry.
        // A robust solution might require checking if an auth.user with this email exists,
        // and if so, linking this driver profile to that auth.user.id as user_id.
        // If not, an admin might need to invite them to create an account first.

        // For adding a new driver profile (not necessarily a new auth user)
        ({ data: responseData, error } = await supabase
          .from('drivers')
          .insert([submissionData])
          .select()
          .single());
      }
      
      if (error) throw error;

      toast({
        title: `Driver ${isEditing ? 'updated' : 'added'} successfully`,
        description: `The driver profile for ${responseData.full_name} has been saved.`,
      });

      onSuccess && onSuccess(responseData);
      onClose();
    } catch (error) {
      toast({
        title: `Error ${isEditing ? 'updating' : 'adding'} driver`,
        description: error.message,
        variant: "destructive",
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
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="bg-card p-6 rounded-lg shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{isEditing ? 'Edit Driver Profile' : 'Add New Driver'}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium mb-1">Full Name</label>
              <input id="full_name" type="text" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} className="w-full input-class" required />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
              <input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full input-class" required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="phone_number" className="block text-sm font-medium mb-1">Phone Number</label>
              <input id="phone_number" type="tel" value={formData.phone_number} onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })} className="w-full input-class" />
            </div>
            <div>
              <label htmlFor="license_number" className="block text-sm font-medium mb-1">License Number</label>
              <input id="license_number" type="text" value={formData.license_number} onChange={(e) => setFormData({ ...formData, license_number: e.target.value })} className="w-full input-class" required />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium mb-1">City</label>
              <input id="city" type="text" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="w-full input-class" />
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-medium mb-1">State/Province</label>
              <input id="state" type="text" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} className="w-full input-class" />
            </div>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium mb-1">Status</label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full input-class"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on_leave">On Leave</option>
            </select>
          </div>

          <style jsx>{`
            .input-class {
              padding: 0.5rem 0.75rem;
              border-radius: 0.375rem;
              border: 1px solid hsl(var(--border));
              background-color: hsl(var(--background));
              width: 100%;
            }
            .input-class:focus {
              outline: none;
              border-color: hsl(var(--primary));
              box-shadow: 0 0 0 2px hsl(var(--primary) / 0.2);
            }
          `}</style>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="min-w-[120px]">
              {loading ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Save Changes' : 'Add Driver')}
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default DriverForm;

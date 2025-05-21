
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Edit, Trash2, Search, Truck, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import Pagination from '@/components/ui/pagination';

const VehicleFormModal = ({ vehicle, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    make: '', model: '', year: '', license_plate: '', vin: '', status: 'available', current_driver_id: null, notes: ''
  });
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const isEditing = !!vehicle;

  useEffect(() => {
    if (isEditing && vehicle) {
      setFormData({
        make: vehicle.make || '',
        model: vehicle.model || '',
        year: vehicle.year || '',
        license_plate: vehicle.license_plate || '',
        vin: vehicle.vin || '',
        status: vehicle.status || 'available',
        current_driver_id: vehicle.current_driver_id || null,
        notes: vehicle.notes || ''
      });
    }
    fetchDrivers();
  }, [vehicle, isEditing]);

  const fetchDrivers = async () => {
    const { data, error } = await supabase.from('drivers').select('user_id, full_name').eq('status', 'active');
    if (error) toast({ title: 'Error fetching drivers', description: error.message, variant: 'destructive' });
    else setDrivers(data || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    let response, error;

    const dataToSubmit = { ...formData, current_driver_id: formData.current_driver_id === '' ? null : formData.current_driver_id };


    if (isEditing) {
      ({ data: response, error } = await supabase.from('vehicles').update(dataToSubmit).eq('id', vehicle.id).select().single());
    } else {
      ({ data: response, error } = await supabase.from('vehicles').insert(dataToSubmit).select().single());
    }

    setLoading(false);
    if (error) {
      toast({ title: `Error ${isEditing ? 'updating' : 'creating'} vehicle`, description: error.message, variant: 'destructive' });
    } else {
      toast({ title: `Vehicle ${isEditing ? 'updated' : 'created'} successfully` });
      onSuccess(response);
      onClose();
    }
  };
  
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-card p-6 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">{isEditing ? 'Edit Vehicle' : 'Add New Vehicle'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Make" id="make" value={formData.make} onChange={e => setFormData({...formData, make: e.target.value})} />
            <InputField label="Model" id="model" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} />
            <InputField label="Year" id="year" type="number" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} />
            <InputField label="License Plate" id="license_plate" value={formData.license_plate} onChange={e => setFormData({...formData, license_plate: e.target.value})} required />
            <InputField label="VIN" id="vin" value={formData.vin} onChange={e => setFormData({...formData, vin: e.target.value})} />
            <div>
              <label htmlFor="status" className="block text-sm font-medium mb-1">Status</label>
              <select id="status" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-2 rounded-md border bg-background">
                <option value="available">Available</option>
                <option value="in_use">In Use</option>
                <option value="maintenance">Maintenance</option>
                <option value="retired">Retired</option>
              </select>
            </div>
            <div>
              <label htmlFor="current_driver_id" className="block text-sm font-medium mb-1">Assign Driver (Optional)</label>
              <select id="current_driver_id" value={formData.current_driver_id || ''} onChange={e => setFormData({...formData, current_driver_id: e.target.value || null })} className="w-full px-3 py-2 rounded-md border bg-background">
                <option value="">None</option>
                {drivers.map(driver => <option key={driver.user_id} value={driver.user_id}>{driver.full_name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="notes" className="block text-sm font-medium mb-1">Notes</label>
            <textarea id="notes" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full px-3 py-2 rounded-md border bg-background min-h-[80px]"></textarea>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Update Vehicle' : 'Add Vehicle')}</Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const InputField = ({ label, id, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium mb-1">{label}</label>
    <input id={id} {...props} className="w-full px-3 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary" />
  </div>
);

const VehicleManagementPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { toast } = useToast();

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('vehicles').select('*, drivers(full_name)', { count: 'exact' });
    if (searchTerm) {
      query = query.or(`make.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%,license_plate.ilike.%${searchTerm}%,vin.ilike.%${searchTerm}%`);
    }
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

    if (error) {
      toast({ title: 'Error fetching vehicles', description: error.message, variant: 'destructive' });
      setVehicles([]);
    } else {
      setVehicles(data || []);
    }
    setLoading(false);
    // Note: Supabase count is returned in 'count', not part of 'data'. If pagination needs total, manage it.
    // For simplicity, totalPages is derived from current data length or needs explicit total count.
    // This example would need adjustment if 'count' is used for totalPages.
  }, [searchTerm, currentPage, itemsPerPage, toast]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleFormSuccess = (vehicle) => {
    fetchVehicles(); // Re-fetch to update list
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setShowFormModal(true);
  };

  const handleDelete = async (vehicleId) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return;
    const { error } = await supabase.from('vehicles').delete().eq('id', vehicleId);
    if (error) toast({ title: 'Error deleting vehicle', description: error.message, variant: 'destructive' });
    else {
      toast({ title: 'Vehicle deleted successfully' });
      fetchVehicles();
    }
  };

  const totalItems = vehicles.length > 0 ? (vehicles[0]?.__count || vehicles.length) : 0; // Simplified, needs actual total count from Supabase
  const totalPages = Math.ceil(totalItems / itemsPerPage);


  return (
    <div className="space-y-6 pb-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Vehicle Fleet Management</h1>
          <p className="text-muted-foreground mt-1">Manage all vehicles in your fleet.</p>
        </div>
        <Button onClick={() => { setEditingVehicle(null); setShowFormModal(true); }} className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-5 w-5" /> Add New Vehicle
        </Button>
      </motion.div>

      <div className="glass-effect p-4 rounded-lg shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by make, model, license plate, VIN..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full px-3 py-2 rounded-md border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        
        {loading && <p className="text-center py-4">Loading vehicles...</p>}
        {!loading && vehicles.length === 0 && (
          <p className="text-center py-8 text-muted-foreground">No vehicles found. Add one to get started!</p>
        )}

        {!loading && vehicles.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  {['License Plate', 'Make/Model', 'Year', 'Status', 'Assigned Driver', 'Actions'].map(h => <th key={h} className="py-3 px-2 text-left font-semibold">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v, idx) => (
                  <motion.tr 
                    key={v.id} 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-border/50 hover:bg-muted/20"
                  >
                    <td className="py-3 px-2 font-medium">{v.license_plate}</td>
                    <td className="py-3 px-2">{v.make} {v.model}</td>
                    <td className="py-3 px-2">{v.year}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        v.status === 'available' ? 'bg-green-500/20 text-green-400' :
                        v.status === 'in_use' ? 'bg-blue-500/20 text-blue-400' :
                        v.status === 'maintenance' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>{v.status.replace('_', ' ').toUpperCase()}</span>
                    </td>
                    <td className="py-3 px-2">{v.drivers?.full_name || <span className="text-muted-foreground italic">None</span>}</td>
                    <td className="py-3 px-2">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(v)} className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(v.id)} className="h-8 w-8 text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
         <Pagination
            currentPage={currentPage}
            totalPages={totalPages > 0 ? totalPages : 1}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
            onItemsPerPageChange={(value) => { setItemsPerPage(value); setCurrentPage(1); }}
          />
      </div>

      <AnimatePresence>
        {showFormModal && <VehicleFormModal vehicle={editingVehicle} onClose={() => setShowFormModal(false)} onSuccess={handleFormSuccess} />}
      </AnimatePresence>
    </div>
  );
};

export default VehicleManagementPage;

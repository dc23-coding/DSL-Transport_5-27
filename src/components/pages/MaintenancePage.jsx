
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Edit, Trash2, Search, Wrench as Tool, CalendarCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import Pagination from '@/components/ui/pagination';

const MaintenanceFormModal = ({ record, vehicles, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    vehicle_id: '', service_type: '', service_date: '', completion_date: null, cost: '', mechanic_notes: '', status: 'scheduled', next_service_due: null
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const isEditing = !!record;

  useEffect(() => {
    if (isEditing && record) {
      setFormData({
        vehicle_id: record.vehicle_id || '',
        service_type: record.service_type || '',
        service_date: record.service_date ? new Date(record.service_date).toISOString().split('T')[0] : '',
        completion_date: record.completion_date ? new Date(record.completion_date).toISOString().split('T')[0] : null,
        cost: record.cost || '',
        mechanic_notes: record.mechanic_notes || '',
        status: record.status || 'scheduled',
        next_service_due: record.next_service_due ? new Date(record.next_service_due).toISOString().split('T')[0] : null,
      });
    }
  }, [record, isEditing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    let response, error;
    
    const dataToSubmit = {
        ...formData,
        completion_date: formData.completion_date || null,
        next_service_due: formData.next_service_due || null,
        cost: formData.cost === '' ? null : parseFloat(formData.cost)
    };

    if (isEditing) {
      ({ data: response, error } = await supabase.from('maintenance_records').update(dataToSubmit).eq('id', record.id).select().single());
    } else {
      ({ data: response, error } = await supabase.from('maintenance_records').insert(dataToSubmit).select().single());
    }

    setLoading(false);
    if (error) {
      toast({ title: `Error ${isEditing ? 'updating' : 'creating'} record`, description: error.message, variant: 'destructive' });
    } else {
      toast({ title: `Maintenance record ${isEditing ? 'updated' : 'created'} successfully` });
      onSuccess(response);
      onClose();
    }
  };
  
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-card p-6 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">{isEditing ? 'Edit Maintenance Record' : 'Add New Maintenance Record'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="vehicle_id" className="block text-sm font-medium mb-1">Vehicle</label>
            <select id="vehicle_id" value={formData.vehicle_id} onChange={e => setFormData({...formData, vehicle_id: e.target.value})} required className="w-full px-3 py-2 rounded-md border bg-background">
              <option value="">Select Vehicle</option>
              {vehicles.map(v => <option key={v.id} value={v.id}>{v.make} {v.model} ({v.license_plate})</option>)}
            </select>
          </div>
          <InputField label="Service Type" id="service_type" value={formData.service_type} onChange={e => setFormData({...formData, service_type: e.target.value})} required />
          <InputField label="Service Date" id="service_date" type="date" value={formData.service_date} onChange={e => setFormData({...formData, service_date: e.target.value})} required />
          <InputField label="Completion Date (Optional)" id="completion_date" type="date" value={formData.completion_date || ''} onChange={e => setFormData({...formData, completion_date: e.target.value})} />
          <InputField label="Cost (Optional)" id="cost" type="number" step="0.01" value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} />
          <div>
            <label htmlFor="status" className="block text-sm font-medium mb-1">Status</label>
            <select id="status" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-2 rounded-md border bg-background">
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <InputField label="Next Service Due (Optional)" id="next_service_due" type="date" value={formData.next_service_due || ''} onChange={e => setFormData({...formData, next_service_due: e.target.value})} />
          <div>
            <label htmlFor="mechanic_notes" className="block text-sm font-medium mb-1">Mechanic Notes</label>
            <textarea id="mechanic_notes" value={formData.mechanic_notes} onChange={e => setFormData({...formData, mechanic_notes: e.target.value})} className="w-full px-3 py-2 rounded-md border bg-background min-h-[80px]"></textarea>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Update Record' : 'Add Record')}</Button>
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


const MaintenancePage = () => {
  const [records, setRecords] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { toast } = useToast();

  const fetchMaintenanceData = useCallback(async () => {
    setLoading(true);
    
    const { data: vehicleData, error: vehicleError } = await supabase.from('vehicles').select('id, make, model, license_plate');
    if (vehicleError) toast({ title: 'Error fetching vehicles', description: vehicleError.message, variant: 'destructive' });
    else setVehicles(vehicleData || []);

    let query = supabase.from('maintenance_records').select('*, vehicles(make, model, license_plate)', { count: 'exact' });
    if (searchTerm) {
      // This search is basic. For relational search (e.g. vehicle make/model), Supabase RPC or more complex client-side filter might be needed.
      query = query.or(`service_type.ilike.%${searchTerm}%,status.ilike.%${searchTerm}%`);
    }
    const { data, error, count } = await query
      .order('service_date', { ascending: false })
      .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

    if (error) {
      toast({ title: 'Error fetching maintenance records', description: error.message, variant: 'destructive' });
      setRecords([]);
    } else {
      setRecords(data || []);
    }
    setLoading(false);
  }, [searchTerm, currentPage, itemsPerPage, toast]);

  useEffect(() => {
    fetchMaintenanceData();
  }, [fetchMaintenanceData]);

  const handleFormSuccess = () => {
    fetchMaintenanceData();
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setShowFormModal(true);
  };

  const handleDelete = async (recordId) => {
    if (!window.confirm('Are you sure you want to delete this maintenance record?')) return;
    const { error } = await supabase.from('maintenance_records').delete().eq('id', recordId);
    if (error) toast({ title: 'Error deleting record', description: error.message, variant: 'destructive' });
    else {
      toast({ title: 'Maintenance record deleted' });
      fetchMaintenanceData();
    }
  };
  
  const totalItems = records.length > 0 ? (records[0]?.__count || records.length) : 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="space-y-6 pb-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Vehicle Maintenance</h1>
          <p className="text-muted-foreground mt-1">Track and manage all maintenance activities.</p>
        </div>
        <Button onClick={() => { setEditingRecord(null); setShowFormModal(true); }} className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-5 w-5" /> Add Maintenance Record
        </Button>
      </motion.div>

      <div className="glass-effect p-4 rounded-lg shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by service type, status..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1);}}
            className="w-full px-3 py-2 rounded-md border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        
        {loading && <p className="text-center py-4">Loading records...</p>}
        {!loading && records.length === 0 && (
          <p className="text-center py-8 text-muted-foreground">No maintenance records found.</p>
        )}

        {!loading && records.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  {['Vehicle', 'Service Type', 'Service Date', 'Status', 'Next Due', 'Actions'].map(h => <th key={h} className="py-3 px-2 text-left font-semibold">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {records.map((r, idx) => (
                  <motion.tr 
                    key={r.id} 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-border/50 hover:bg-muted/20"
                  >
                    <td className="py-3 px-2 font-medium">{r.vehicles?.make} {r.vehicles?.model} ({r.vehicles?.license_plate || 'N/A'})</td>
                    <td className="py-3 px-2">{r.service_type}</td>
                    <td className="py-3 px-2">{new Date(r.service_date).toLocaleDateString()}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        r.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        r.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' :
                        r.status === 'in_progress' ? 'bg-sky-500/20 text-sky-400' :
                        r.status === 'overdue' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400' // For 'cancelled' or other
                      }`}>{r.status.replace('_', ' ').toUpperCase()}</span>
                    </td>
                    <td className="py-3 px-2">{r.next_service_due ? new Date(r.next_service_due).toLocaleDateString() : <span className="text-muted-foreground italic">N/A</span>}</td>
                    <td className="py-3 px-2">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(r)} className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(r.id)} className="h-8 w-8 text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
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
        {showFormModal && <MaintenanceFormModal record={editingRecord} vehicles={vehicles} onClose={() => setShowFormModal(false)} onSuccess={handleFormSuccess} />}
      </AnimatePresence>
    </div>
  );
};

export default MaintenancePage;

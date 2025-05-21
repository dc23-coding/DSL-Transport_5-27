
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, Edit, Trash2, Search, UserCheck, UserX, UserMinus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import DriverForm from '@/components/forms/DriverForm';
import Pagination from '@/components/ui/pagination';
import { supabase } from '@/lib/supabase';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const DriverManagementPage = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDriverForm, setShowDriverForm] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const { toast } = useToast();

  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('drivers')
        .select('id, user_id, full_name, email, phone_number, license_number, status, city, state', { count: 'exact' });

      if (searchTerm) {
        query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,license_number.ilike.%${searchTerm}%`);
      }

      const { data, error, count } = await query
        .order('full_name', { ascending: true })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

      if (error) {
        toast({ title: "Error fetching drivers", description: error.message, variant: "destructive" });
        setDrivers([]);
        setTotalItems(0);
      } else {
        setDrivers(data || []);
        setTotalItems(count || 0);
      }
    } catch (e) {
      toast({ title: "Client-side error fetching drivers", description: e.message, variant: "destructive" });
      setDrivers([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, currentPage, itemsPerPage, toast]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  const handleFormSuccess = () => {
    setShowDriverForm(false);
    setEditingDriver(null);
    fetchDrivers(); // Refresh data
  };

  const handleEditDriver = (driver) => {
    setEditingDriver(driver);
    setShowDriverForm(true);
  };

  const handleDeleteDriver = async (driverId) => {
    // Note: Deleting a driver might require deleting the associated auth.users entry first,
    // or handling it via a Supabase Edge Function for cascading deletes if RLS allows.
    // For simplicity, we're just deleting from the 'drivers' table.
    // Consider data integrity implications for related tables (loads, payroll).
    const { error } = await supabase.from('drivers').delete().eq('id', driverId);
    if (error) {
      toast({ title: "Error deleting driver", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Driver Deleted", description: "Driver profile has been removed." });
      fetchDrivers(); // Refresh data
    }
  };
  
  const handleStatusToggle = async (driverId, newStatus) => {
    const { error } = await supabase
      .from('drivers')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', driverId);
    
    if (error) {
      toast({ title: "Error updating status", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Status Updated", description: `Driver status changed to ${newStatus}.` });
      fetchDrivers(); // Refresh data
    }
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <UserCheck className="h-5 w-5 text-green-500" />;
      case 'inactive': return <UserX className="h-5 w-5 text-red-500" />;
      case 'on_leave': return <UserMinus className="h-5 w-5 text-yellow-500" />;
      default: return <UserMinus className="h-5 w-5 text-gray-500" />; // Default for null or other statuses
    }
  };
  
  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Active';
      case 'inactive': return 'Inactive';
      case 'on_leave': return 'On Leave';
      default: return status || 'Unknown';
    }
  };


  return (
    <div className="space-y-6 pb-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold">Driver Management</h1>
          <p className="text-muted-foreground mt-1">Manage all company drivers.</p>
        </div>
        <Button onClick={() => { setEditingDriver(null); setShowDriverForm(true); }} className="gap-2 w-full sm:w-auto">
          <PlusCircle className="h-5 w-5" /> Add New Driver
        </Button>
      </motion.div>

      <div className="glass-effect p-4 rounded-lg shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, email, city, license..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full px-3 py-2 rounded-md border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {loading && <p className="text-center py-4">Loading drivers...</p>}
        {!loading && drivers.length === 0 && (
          <p className="text-center py-8 text-muted-foreground">No drivers found matching your criteria.</p>
        )}

        {!loading && drivers.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  {['Name', 'Contact', 'Location', 'License No.', 'Status', 'Actions'].map(h => <th key={h} className="py-3 px-2 text-left font-semibold">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {drivers.map((driver, index) => (
                  <motion.tr
                    key={driver.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-border/50 hover:bg-muted/20"
                  >
                    <td className="py-3 px-2 font-medium">{driver.full_name || 'N/A'}</td>
                    <td className="py-3 px-2">
                      <div>{driver.email || 'N/A'}</div>
                      <div className="text-xs text-muted-foreground">{driver.phone_number || 'N/A'}</div>
                    </td>
                    <td className="py-3 px-2">{driver.city || 'N/A'}, {driver.state || 'N/A'}</td>
                    <td className="py-3 px-2">{driver.license_number || 'N/A'}</td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(driver.status)}
                        <select 
                          value={driver.status || 'inactive'} 
                          onChange={(e) => handleStatusToggle(driver.id, e.target.value)}
                          className="bg-transparent border-none p-1 text-xs rounded focus:ring-1 focus:ring-primary"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="on_leave">On Leave</option>
                        </select>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditDriver(driver)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the driver profile. This might also affect related records like loads and payroll entries.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteDriver(driver.id)} className="bg-red-600 hover:bg-red-700">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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
      {showDriverForm && (
        <DriverForm
          onClose={() => { setShowDriverForm(false); setEditingDriver(null); }}
          onSuccess={handleFormSuccess}
          driver={editingDriver}
        />
      )}
    </div>
  );
};

export default DriverManagementPage;

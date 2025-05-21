// src/pages/FullPayrollPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Download, Search, Calendar, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useToast } from '@/components/ui/use-toast';
import Pagination from '@/components/ui/pagination';
import PayrollForm from '@/components/forms/PayrollForm';

const FullPayrollPage = () => {
  const [payrollData, setPayrollData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split('T')[0],
    end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
      .toISOString()
      .split('T')[0]
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const { toast } = useToast();
  const [showPayrollForm, setShowPayrollForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);

  const fetchPayrollData = useCallback(async () => {
    setLoading(true);
    const rangeStart = (currentPage - 1) * itemsPerPage;
    const rangeEnd = rangeStart + itemsPerPage - 1;

    // Try embedded join first
    let query = supabase
      .from('payroll')
      .select(
        'id, amount, period_start, period_end, payment_date, status, drivers(full_name)',
        { count: 'exact' }
      )
      .gte('payment_date', dateRange.start)
      .lte('payment_date', dateRange.end);

    if (searchTerm) {
      query = query.ilike('drivers.full_name', `%${searchTerm}%`);
    }

    try {
      const { data, error, count } = await query
        .order('payment_date', { ascending: false })
        .range(rangeStart, rangeEnd);

      if (error) {
        // Fallback if no foreign-key relationship
        if (error.code === 'PGRST200') {
          const { data: rawData, error: rawError, count: rawCount } = await supabase
            .from('payroll')
            .select(
              'id, amount, period_start, period_end, payment_date, status, driver_id',
              { count: 'exact' }
            )
            .gte('payment_date', dateRange.start)
            .lte('payment_date', dateRange.end)
            .order('payment_date', { ascending: false })
            .range(rangeStart, rangeEnd);

          if (rawError) {
            toast({
              title: 'Error fetching payroll data',
              description: rawError.message,
              variant: 'destructive'
            });
            setPayrollData([]);
            setTotalItems(0);
          } else {
            // Batch fetch driver names
            const driverIds = [...new Set(rawData.map(p => p.driver_id))];
            const { data: driversList } = await supabase
              .from('drivers')
              .select('id, full_name')
              .in('id', driverIds);
            const driverMap = driversList.reduce((acc, d) => {
              acc[d.id] = d.full_name;
              return acc;
            }, {});
            const merged = rawData.map(p => ({
              ...p,
              drivers: { full_name: driverMap[p.driver_id] || 'N/A' }
            }));
            setPayrollData(merged);
            setTotalItems(rawCount || 0);
          }
          return;
        }

        if (error.code !== '42P01') {
          toast({
            title: 'Error fetching payroll data',
            description: error.message,
            variant: 'destructive'
          });
        }
        setPayrollData([]);
        setTotalItems(0);
      } else {
        setPayrollData(data || []);
        setTotalItems(count || 0);
      }
    } catch (e) {
      toast({
        title: 'Client-side error fetching payroll data',
        description: e.message,
        variant: 'destructive'
      });
      setPayrollData([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [dateRange, searchTerm, currentPage, itemsPerPage, toast]);

  useEffect(() => {
    fetchPayrollData();
  }, [fetchPayrollData]);

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Payroll Report', 14, 16);
    doc.autoTable({
      startY: 20,
      head: [['Driver', 'Period', 'Amount ($)', 'Status', 'Payment Date']],
      body: payrollData.map(p => [
        p.drivers?.full_name || 'N/A',
        `${new Date(p.period_start).toLocaleDateString()} - ${new Date(
          p.period_end
        ).toLocaleDateString()}`,
        Number(p.amount).toFixed(2),
        p.status,
        new Date(p.payment_date).toLocaleDateString()
      ])
    });
    doc.save('payroll-report.pdf');
  };

  const exportToCSV = () => {
    const headers = ['Driver', 'Period Start', 'Period End', 'Amount', 'Status', 'Payment Date'];
    const csvContent = [
      headers.join(','),
      ...payrollData.map(p =>
        [`"${p.drivers?.full_name || 'N/A'}"`, p.period_start, p.period_end, p.amount, p.status, p.payment_date].join(',')
      )
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'payroll-report.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleFormSuccess = () => {
    setShowPayrollForm(false);
    setEditingPayment(null);
    fetchPayrollData();
  };

  const handleEditPayment = payment => {
    setEditingPayment(payment);
    setShowPayrollForm(true);
  };

  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  return (
    <div className="space-y-6 pb-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold">Full Payroll Overview</h1>
          <p className="text-muted-foreground mt-1">Manage and track all payroll activities.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => { setEditingPayment(null); setShowPayrollForm(true); }} className="w-full sm:w-auto">
            Create Payment
          </Button>
          <Button onClick={exportToCSV} variant="outline" className="gap-2 w-full sm:w-auto">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
          <Button onClick={exportToPDF} variant="outline" className="gap-2 w-full sm:w-auto">
            <Download className="h-4 w-4" /> Export PDF
          </Button>
        </div>
      </motion.div>

      <div className="glass-effect p-4 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <input
              type="date"
              value={dateRange.start}
              onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full px-3 py-2 rounded-md border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <input
              type="date"
              value={dateRange.end}
              onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full px-3 py-2 rounded-md border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by driver name..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 rounded-md border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {loading && <p className="text-center py-4">Loading payroll data...</p>}
        {!loading && !payrollData.length && (
          <p className="text-center py-8 text-muted-foreground">
            No payroll records found for the selected criteria.
          </p>
        )}

        {!loading && payrollData.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="py-3 px-2 text-left font-semibold">Driver</th>
                  <th className="py-3 px-2 text-left font-semibold">Period</th>
                  <th className="py-3 px-2 text-left font-semibold">Amount ($)</th>
                  <th className="py-3 px-2 text-left font-semibold">Status</th>
                  <th className="py-3 px-2 text-left font-semibold">Payment Date</th>
                  <th className="py-3 px-2 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payrollData.map((payment, idx) => (
                  <motion.tr
                    key={payment.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-border/50 hover:bg-muted/20"
                  >
                    <td className="py-3 px-2">{payment.drivers.full_name}</td>
                    <td className="py-3 px-2">
                      {new Date(payment.period_start).toLocaleDateString()} -{' '}
                      {new Date(payment.period_end).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-2 font-medium text-green-400">
                      ${Number(payment.amount).toFixed(2)}
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          payment.status === 'Paid'
                            ? 'bg-green-500/20 text-green-300'
                            : payment.status === 'Processing'
                            ? 'bg-yellow-500/20 text-yellow-300'
                            : payment.status === 'Pending'
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'bg-red-500/20 text-red-300'
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      {new Date(payment.payment_date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEditPayment(payment)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          totalItems={totalItems}
          onItemsPerPageChange={val => {
            setItemsPerPage(val);
            setCurrentPage(1);
          }}
        />
      </div>

      {showPayrollForm && (
        <PayrollForm
          onClose={() => {
            setShowPayrollForm(false);
            setEditingPayment(null);
          }}
          onSuccess={handleFormSuccess}
          payment={editingPayment}
        />
      )}
    </div>
  );
};

export default FullPayrollPage;

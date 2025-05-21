// src/components/columns/PayrollColumn.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Calendar, Clock, FileText, MoreHorizontal, Plus, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import PayrollForm from '@/components/forms/PayrollForm';

const PayrollColumn = () => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPayrollForm, setShowPayrollForm] = useState(false);
  const [filter, setFilter] = useState('All Payments');
  const [activePayment, setActivePayment] = useState(null);
  const { toast } = useToast();

  // 🔄 Fetch Payroll Records from Supabase
  const fetchPayroll = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('payroll').select('*');
    if (error) {
      toast({ title: 'Error fetching payroll', description: error.message, variant: 'destructive' });
      console.error(error);
    }
    const fetchedData = data && data.length > 0 ? data : fallbackData;
    setPayments(fetchedData);
    applyFilter(fetchedData, filter);
    setLoading(false);
  }, [toast, filter]);

  // 🏃 Initial Fetch on Mount
  useEffect(() => {
    fetchPayroll();
  }, [fetchPayroll]);

  // 🛠️ Fallback Static Data
  const fallbackData = [
    {
      id: 1,
      driver: 'Michael Johnson',
      amount: '2450.75',
      period_start: '2025-05-01',
      period_end: '2025-05-15',
      status: 'Paid',
      statusColor: 'bg-green-500',
      payment_date: '2025-05-16'
    },
    {
      id: 2,
      driver: 'Sarah Williams',
      amount: '1875.30',
      period_start: '2025-05-01',
      period_end: '2025-05-15',
      status: 'Processing',
      statusColor: 'bg-yellow-500',
      payment_date: '2025-05-16'
    }
  ];

  // 🧠 Apply Status Filter
  const applyFilter = (data, filterValue) => {
    if (filterValue === 'All Payments') {
      setFilteredPayments(data);
    } else {
      setFilteredPayments(data.filter(payment => payment.status === filterValue));
    }
  };

  // 🏃 Re-apply Filter on Filter Change
  useEffect(() => {
    applyFilter(payments, filter);
  }, [filter, payments]);

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
          <DollarSign className="h-5 w-5 text-yellow-400" />
          <h2 className="text-xl font-bold">Payroll</h2>
        </div>
        <Button size="sm" className="gap-1" onClick={() => setShowPayrollForm(true)}>
          <Plus className="h-4 w-4" />
          <span>New Payment</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {['All Payments', 'Processing', 'Paid'].map(status => (
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

      {/* Payroll List */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : (
          filteredPayments.map((item, i) => (
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
                  <div className={`h-2 w-2 rounded-full ${item.status === 'Paid' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <span className="text-xs text-muted-foreground">{item.status}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3 text-muted-foreground" />
                  <span className="font-medium">${parseFloat(item.amount).toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span>{item.payment_date}</span>
                </div>
                <div className="flex items-center gap-1 col-span-2">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span>Period: {item.period_start} - {item.period_end}</span>
                </div>
              </div>

              <div className="mt-3 flex justify-between items-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 px-2 gap-1"
                  onClick={() => setActivePayment(item)}
                >
                  <FileText className="h-3 w-3" />
                  <span>View Statement</span>
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Payroll Form Modal */}
      {showPayrollForm && (
        <PayrollForm onClose={() => setShowPayrollForm(false)} onSuccess={fetchPayroll} />
      )}

      {/* View Statement Modal */}
      {activePayment && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Payment Statement</h2>
              <Button variant="ghost" size="icon" onClick={() => setActivePayment(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2 text-sm">
              <p><strong>Driver:</strong> {activePayment.driver || 'Unassigned'}</p>
              <p><strong>Amount:</strong> ${parseFloat(activePayment.amount).toFixed(2)}</p>
              <p><strong>Payment Date:</strong> {activePayment.payment_date}</p>
              <p><strong>Status:</strong> {activePayment.status}</p>
              <p><strong>Period:</strong> {activePayment.period_start} - {activePayment.period_end}</p>
            </div>
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={() => setActivePayment(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollColumn;

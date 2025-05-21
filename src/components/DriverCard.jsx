// /components/DriverCard.jsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

const statusStyles = {
  Available: 'text-green-500',
  Busy: 'text-yellow-500',
  'Off Duty': 'text-gray-500',
};

const DriverCard = ({ driver, onStatusChange }) => {
  const { toast } = useToast();
  const statusClass = statusStyles[driver.status] || 'text-gray-500';

  const handleStatusToggle = async () => {
    const newStatus = driver.status === 'Available' ? 'Busy' : 'Available';
    const { error } = await supabase
      .from('drivers')
      .update({ status: newStatus })
      .eq('id', driver.id);

    if (error) {
      toast({ title: 'Status Update Failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: `Status changed to ${newStatus}` });
      onStatusChange && onStatusChange();
    }
  };

  return (
    <div className="gradient-border bg-card p-4 rounded-lg flex justify-between items-center">
      <div>
        <p className="font-medium">{driver.name}</p>
        <p className="text-sm text-muted-foreground">{driver.city}, {driver.state}</p>
        <p className={`text-sm ${statusClass}`}>{driver.status}</p>
      </div>
      <div className="flex flex-col gap-2">
        <Button onClick={() => alert(`Connecting with ${driver.name}`)}>Connect</Button>
        <Button onClick={handleStatusToggle} variant="outline" size="sm">
          Toggle Status
        </Button>
      </div>
    </div>
  );
};

export default DriverCard;

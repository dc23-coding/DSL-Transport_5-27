
import React from 'react';
import { motion } from 'framer-motion';
import { UserCog, Truck, Briefcase } from 'lucide-react';

const roles = [
  { id: 'driver', name: 'Driver', icon: <Truck className="h-8 w-8" />, description: "For truck drivers and operators." },
  { id: 'broker', name: 'Broker/Dispatcher', icon: <Briefcase className="h-8 w-8" />, description: "For logistics and dispatch staff." },
  { id: 'admin', name: 'Admin', icon: <UserCog className="h-8 w-8" />, description: "System administrators (password protected)." },
];

const RoleSelection = ({ selectedRole, setSelectedRole }) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium text-center mb-4">Select Your Role</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {roles.map((role) => (
          <motion.button
            key={role.id}
            type="button"
            onClick={() => setSelectedRole(role.id)}
            className={`p-4 border rounded-lg flex flex-col items-center text-center transition-all duration-200 ease-in-out
              ${selectedRole === role.id
                ? 'border-primary ring-2 ring-primary bg-primary/10 shadow-lg scale-105'
                : 'border-border hover:border-primary/70 hover:shadow-md'
              }`}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className={`mb-2 p-3 rounded-full transition-colors ${selectedRole === role.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              {role.icon}
            </div>
            <span className={`font-semibold ${selectedRole === role.id ? 'text-primary' : ''}`}>{role.name}</span>
            <p className="text-xs text-muted-foreground mt-1">{role.description}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default RoleSelection;

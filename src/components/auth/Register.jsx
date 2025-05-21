
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext'; // Use useAuth
import RoleSelection from '@/components/auth/RoleSelection';
import RegisterFormFields from '@/components/auth/RegisterFormFields';

const ADMIN_PASSWORD = 'AdminPass123'; // Development-only password

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);
  const [adminPasswordAttempt, setAdminPasswordAttempt] = useState(''); // Renamed from adminPassword to avoid conflict
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { register } = useAuth(); // Use register from context

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({ title: "Registration failed", description: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (!selectedRole) {
      toast({ title: "Registration failed", description: "Please select a role", variant: "destructive" });
      return;
    }
    if (selectedRole === 'admin' && adminPasswordAttempt !== ADMIN_PASSWORD) {
      toast({ title: "Registration failed", description: "Invalid admin password", variant: "destructive" });
      return;
    }
    if (!fullName.trim()) {
      toast({ title: "Registration failed", description: "Full name is required", variant: "destructive" });
      return;
    }

    setLoading(true);
    // Use register function from AuthContext
    const { user, error } = await register(email, password, selectedRole, fullName);
    setLoading(false);

    if (error) {
      // Toast is handled by AuthContext's register function
      return;
    }
    
    if (user) {
       // Toast for success (or email verification) handled by AuthContext
      switch (selectedRole) {
        case 'admin': navigate('/admin-dashboard'); break;
        case 'driver': navigate('/driver-dashboard'); break;
        case 'broker': navigate('/broker-dashboard'); break;
        default: navigate('/'); // Fallback to main dashboard router
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-var(--header-height,4rem))] flex items-center justify-center py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <div className="glass-effect rounded-lg p-8 shadow-xl">
          <div className="flex flex-col items-center mb-8">
            <img 
              src="https://storage.googleapis.com/hostinger-horizons-assets-prod/981c1f7c-d49b-4a25-b84f-4712fb519dd3/6767e24e0e87af195e66f7aff138577e.png"
              alt="DSL Transport Logo"
              className="h-16 w-auto mb-4"
            />
            <h2 className="text-2xl font-bold">Create Account</h2>
            <p className="text-muted-foreground mt-2">Join DSL Transport</p>
          </div>

          <RoleSelection selectedRole={selectedRole} setSelectedRole={setSelectedRole} />

          <form onSubmit={handleRegister} className="space-y-4">
            <RegisterFormFields
              fullName={fullName} setFullName={setFullName}
              email={email} setEmail={setEmail}
              password={password} setPassword={setPassword}
              confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
              adminPassword={adminPasswordAttempt} setAdminPassword={setAdminPasswordAttempt}
              selectedRole={selectedRole}
            />
            <Button type="submit" className="w-full" disabled={loading || !selectedRole}>
              {loading ? 'Creating account...' : 'Register'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;

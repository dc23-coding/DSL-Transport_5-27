// src/components/auth/ResetPassword.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.api.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`
    });
    setLoading(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Email Sent', description: 'Check your inbox for reset link', variant: 'default' });
      navigate('/login');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="glass-effect rounded-lg p-8 shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
        <form onSubmit={handleReset} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full p-2 rounded bg-input"
            required
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>
        <p className="mt-4 text-sm text-muted-foreground">
          Remembered?{' '}
          <button onClick={() => navigate('/login')} className="text-primary underline">
            Login
          </button>
        </p>
      </div>
    </div>
  );
}

// src/components/auth/UpdatePassword.jsx
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

export default function UpdatePassword() {
  const [searchParams] = useSearchParams();
  const accessToken = searchParams.get('access_token');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!accessToken) {
      toast({ title: 'Error', description: 'Invalid or expired link', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.api.updateUser(accessToken, { password });
    setLoading(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Password updated', variant: 'default' });
      navigate('/login');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="glass-effect rounded-lg p-8 shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Set New Password</h2>
        <form onSubmit={handleUpdate} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            className="w-full p-2 rounded bg-input"
            required
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </Button>
        </form>
      </div>
    </div>
  );
}

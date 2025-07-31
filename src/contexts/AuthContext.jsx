import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext();
const VALID_ROLES = new Set(['admin', 'driver', 'broker']);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [adminMode, setAdminMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const updateUser = (session) => {
      const user = session?.user ?? null;
      setUser(user);
      const role = user?.app_metadata?.role || user?.user_metadata?.role;
      if (import.meta.env.DEV) {
        console.log('🧠 Session User:', user?.email);
        console.log('🧠 App Metadata:', user?.app_metadata);
        console.log('🧠 Extracted Role:', role);
      }
      setUserRole(role ?? null);
    };

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error && import.meta.env.DEV) {
        console.error('🧠 Get Session Error:', error);
      }
      if (import.meta.env.DEV) {
        console.log('🧠 Initial Session:', session?.user?.email);
      }
      updateUser(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (import.meta.env.DEV) {
        console.log('🧠 Auth State Changed:', _event);
      }
      updateUser(session);
    });

    return () => subscription?.unsubscribe();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: 'Login Failed', description: error.message, variant: 'destructive' });
      return { error };
    }
    return { user: data?.user };
  };

  const register = async (email, password, role, fullName) => {
    setLoading(true);
    if (!VALID_ROLES.has(role)) {
      setLoading(false);
      throw new Error(`Invalid role: ${role}`);
    }
    if (import.meta.env.DEV) {
      console.log('🧠 Registering with:', { email, role, fullName });
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName || email.split('@')[0] },
      },
    });
    if (error) {
      toast({ title: 'Registration Failed', description: error.message, variant: 'destructive' });
      setLoading(false);
      return { error };
    }
    const user = data.user;
    if (!user) {
      toast({ title: 'Verify Email', description: 'Check your inbox to complete registration.' });
      setLoading(false);
      return {};
    }
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      app_metadata: { role },
    });
    if (updateError) {
      toast({ title: 'Role Assignment Failed', description: updateError.message, variant: 'destructive' });
      setLoading(false);
      return { error: updateError };
    }
    if (import.meta.env.DEV) {
      console.log('🧠 Updated App Metadata:', { role });
    }
    const baseData = { id: user.id, email, name: fullName || email.split('@')[0] };
    try {
      if (role === 'admin') await supabase.from('admins').insert(baseData);
      else if (role === 'driver') await supabase.from('drivers').insert({ ...baseData, status: 'active' });
      else if (role === 'broker') await supabase.from('brokers').insert(baseData);
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('🧠 Table Insertion Error:', err);
      }
    }
    toast({ title: 'Registration Successful', description: 'Please check your email to verify your account.' });
    setLoading(false);
    return { user };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserRole(null);
    setAdminMode(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,
        loading,
        login,
        register,
        logout,
        adminMode,
        setAdminMode,
        isAdmin: userRole === 'admin',
        isDriver: userRole === 'driver',
        isBroker: userRole === 'broker',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
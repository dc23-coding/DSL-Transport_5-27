import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext();
const VALID_ROLES = new Set(['admin', 'driver', 'broker']);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [devBypass, setDevBypass] = useState(false);
  const { toast } = useToast();

  // ✅ Secure session and role extraction
  useEffect(() => {
    const updateUser = (session) => {
      const user = session?.user ?? null;
      setUser(user);
      
      // Check both possible role locations
      const role = user?.app_metadata?.role || user?.user_metadata?.role;
      
      if (role && !VALID_ROLES.has(role)) {
        console.error('Invalid role detected:', role);
        setUserRole(null);
      } else {
        setUserRole(role ?? null);
      }
    };

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      updateUser(session);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      updateUser(session);
      setLoading(false);
    });

    return () => listener?.subscription.unsubscribe();
  }, []);

  // ✅ Login logic
  const login = async (email, password) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      toast({ 
        title: 'Login Failed', 
        description: error.message, 
        variant: 'destructive' 
      });
      return { error };
    }

    return { user: data?.user };
  };

  // ✅ Secure registration with role validation
  const register = async (email, password, role, fullName) => {
    setLoading(true);

    // Validate role first
    if (!VALID_ROLES.has(role)) {
      setLoading(false);
      throw new Error(`Invalid role: ${role}`);
    }

    // Sign up with separated metadata
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || email.split('@')[0]
        }
      },
      app_metadata: { role } // Store role more securely
    });

    if (error) {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive"
      });
      setLoading(false);
      return { error };
    }

    const user = data.user;
    if (!user) {
      toast({
        title: "Verify Email",
        description: "Check your inbox to complete registration.",
      });
      setLoading(false);
      return {};
    }

    // Insert into appropriate table
    const baseData = {
      id: user.id,
      email,
      name: fullName || email.split('@')[0]
    };

    try {
      if (role === 'admin') {
        await supabase.from('admins').insert(baseData);
      } else if (role === 'driver') {
        await supabase.from('drivers').insert({ ...baseData, status: 'active' });
      } else if (role === 'broker') {
        await supabase.from('brokers').insert(baseData);
      }
    } catch (err) {
      console.error('Failed to insert role data:', err);
    }

    toast({
      title: "Registration Successful",
      description: "Please check your email to verify your account.",
    });

    setLoading(false);
    return { user };
  };

  // ✅ Logout logic
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserRole(null);
    setDevBypass(false);
  };

  // ✅ Improved dev bypass
  const activateBypass = () => {
    setDevBypass(true);
    const fakeUser = {
      id: 'bypass-dev-user',
      email: 'dev@dsl.dev',
      app_metadata: { role: 'admin' },
      user_metadata: { full_name: 'Developer' }
    };
    setUser(fakeUser);
    setUserRole('admin');
    toast({
      title: "Developer Mode Activated",
      description: "You now have admin privileges",
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      userRole,
      loading,
      login,
      register,
      logout,
      devBypass,
      activateBypass,
      isAdmin: userRole === 'admin' || devBypass,
      isDriver: userRole === 'driver',
      isBroker: userRole === 'broker'
    }}>
      {children}
    </AuthContext.Provider>
  );
};
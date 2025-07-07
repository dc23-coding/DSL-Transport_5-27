import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [devBypass, setDevBypass] = useState(false);
  const { toast } = useToast();

  // ✅ Handle session and role extraction
  useEffect(() => {
    const updateUser = (session) => {
      const user = session?.user ?? null;
      setUser(user);
      setUserRole(user?.user_metadata?.role ?? null);
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
      toast({ title: 'Login Failed', description: error.message, variant: 'destructive' });
    }

    return { user: data?.user, error };
  };

  // ✅ Register and insert into role table
  const register = async (email, password, role, fullName) => {
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
          full_name: fullName || email.split('@')[0]
        }
      }
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

    const baseData = {
      id: user.id,
      email,
      name: fullName || email.split('@')[0]
    };

    if (role === 'admin') {
      await supabase.from('admins').insert(baseData);
    } else if (role === 'driver') {
      await supabase.from('drivers').insert({ ...baseData, status: 'active' });
    } else if (role === 'broker') {
      await supabase.from('brokers').insert(baseData);
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

  // ✅ Dev bypass (simulate admin)
  const activateBypass = () => {
    setDevBypass(true);
    const fakeUser = {
      email: 'dev@dsl.dev',
      user_metadata: { role: 'admin' }
    };
    setUser(fakeUser);
    setUserRole('admin');
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
      activateBypass
    }}>
      {children}
    </AuthContext.Provider>
  );
};

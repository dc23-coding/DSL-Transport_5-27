import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext();
const VALID_ROLES = new Set(['admin', 'driver', 'broker']);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [adminMode, setAdminMode] = useState(false);
  const [devBypass, setDevBypass] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const updateUser = (session) => {
      const user = session?.user ?? null;
      setUser(user);
      const role = devBypass ? 'admin' : (user?.app_metadata?.role || user?.user_metadata?.role);
      console.log('🧠 Session User:', user?.email);
      console.log('🧠 App Metadata:', user?.app_metadata);
      console.log('🧠 User Metadata:', user?.user_metadata);
      console.log('🧠 Dev Bypass:', devBypass);
      console.log('🧠 Extracted Role:', role);
      if (role && !VALID_ROLES.has(role)) {
        console.error('Invalid role detected:', role);
        setUserRole(null);
      } else {
        setUserRole(role ?? null);
      }
    };

    supabase.auth.onAuthStateChange((_event, session) => {
      console.log('🧠 Auth State Changed:', _event);
      updateUser(session);
    });

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) console.error('🧠 Get Session Error:', error);
      console.log('🧠 Initial Session:', session?.user?.email);
      updateUser(session);
      setLoading(false);
    });
  }, [devBypass]);

  const activateBypass = () => {
    setDevBypass(true);
    setUserRole('admin');
    console.log('🧠 Dev Bypass Activated');
  };

  const login = async (email, password) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: 'Login Failed', description: error.message, variant: 'destructive' });
      console.error('🧠 Login Error:', error);
      return { error };
    }
    console.log('🧠 Login Success:', data.user.email);
    return { user: data?.user };
  };

  const register = async (email, password, role, fullName) => {
    setLoading(true);
    if (!VALID_ROLES.has(role)) {
      setLoading(false);
      console.error('🧠 Invalid Role during Registration:', role);
      throw new Error(`Invalid role: ${role}`);
    }
    console.log('🧠 Registering with:', { email, role, fullName });
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName || email.split('@')[0] }
      }
    });
    if (error) {
      toast({ title: "Registration Failed", description: error.message, variant: "destructive" });
      console.error('🧠 Registration Error:', error);
      setLoading(false);
      return { error };
    }
    const user = data.user;
    console.log('🧠 Registered User:', user?.email);
    console.log('🧠 Registered User App Metadata:', user?.app_metadata);
    if (!user) {
      toast({ title: "Verify Email", description: "Check your inbox to complete registration." });
      setLoading(false);
      return {};
    }
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      app_metadata: { role }
    });
    if (updateError) {
      toast({ title: "Role Assignment Failed", description: updateError.message, variant: "destructive" });
      console.error('🧠 Update App Metadata Error:', updateError);
      setLoading(false);
      return { error: updateError };
    }
    console.log('🧠 Updated App Metadata:', { role });
    const baseData = { id: user.id, email, name: fullName || email.split('@')[0] };
    try {
      if (role === 'admin') {
        const { error } = await supabase.from('admins').insert(baseData);
        if (error) console.error('🧠 Admin Table Insertion Error:', error);
      } else if (role === 'driver') {
        const { error } = await supabase.from('drivers').insert({ ...baseData, status: 'active' });
        if (error) console.error('🧠 Driver Table Insertion Error:', error);
      } else if (role === 'broker') {
        const { error } = await supabase.from('brokers').insert(baseData);
        if (error) console.error('🧠 Broker Table Insertion Error:', error);
      }
    } catch (err) {
      console.error('🧠 Table Insertion Error:', err);
    }
    toast({ title: "Registration Successful", description: "Please check your email to verify your account." });
    setLoading(false);
    return { user };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserRole(null);
    setAdminMode(false);
    setDevBypass(false);
    console.log('🧠 Logged Out');
  };

  return (
    <AuthContext.Provider value={{
      user,
      userRole,
      loading,
      login,
      register,
      logout,
      adminMode,
      setAdminMode,
      devBypass,
      activateBypass,
      isAdmin: userRole === 'admin',
      isDriver: userRole === 'driver',
      isBroker: userRole === 'broker'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default GlobalNavControls;
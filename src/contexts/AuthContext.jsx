
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/components/ui/use-toast";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adminMode, setAdminMode] = useState(false); // Keep adminMode for now if needed, but prioritize real auth
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        setUserRole(session?.user?.user_metadata?.role ?? null);
        
        if (_event === 'SIGNED_IN' && session?.user?.user_metadata?.role === 'driver') {
          // Ensure driver profile exists, create if not
          const { data: driverProfile, error: profileError } = await supabase
            .from('drivers')
            .select('user_id')
            .eq('user_id', session.user.id)
            .single();

          if (profileError && profileError.code === 'PGRST116') { // PGRST116: "No rows found"
             const { error: insertError } = await supabase.from('drivers').insert({
              user_id: session.user.id,
              full_name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
              email: session.user.email,
              status: 'active' 
            });
            if (insertError) {
              toast({ title: "Driver Profile Error", description: `Failed to create driver profile: ${insertError.message}`, variant: "destructive" });
            }
          } else if (profileError) {
            toast({ title: "Driver Profile Error", description: `Error fetching driver profile: ${profileError.message}`, variant: "destructive" });
          }
        }
        setLoading(false);
      }
    );

    // Check initial session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setUserRole(session?.user?.user_metadata?.role ?? null);
      setLoading(false);
    };
    checkSession();

    return () => {
      subscription?.unsubscribe();
    };
  }, [toast]);

  const login = async (email, password) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ title: "Login Failed", description: error.message, variant: "destructive" });
    }
    setLoading(false);
    return { error };
  };

  const register = async (email, password, role, fullName) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: role,
          full_name: fullName || email.split('@')[0]
        },
      },
    });
    
    if (error) {
      toast({ title: "Registration Failed", description: error.message, variant: "destructive" });
    } else if (data.user && role === 'driver') {
        const { error: driverError } = await supabase
          .from('drivers')
          .insert([{ 
            user_id: data.user.id,
            full_name: fullName || data.user.email.split('@')[0],
            email: data.user.email,
            status: 'active' 
          }]);
        if (driverError) {
            toast({ title: "Driver Profile Error", description: `Failed to create driver profile: ${driverError.message}`, variant: "destructive" });
             // Potentially roll back user creation or handle cleanup if critical
        }
    } else if (data.user) {
         toast({ title: "Registration Successful", description: "Please check your email to verify your account." });
    }
    setLoading(false);
    return { user: data.user, error };
  };

  const logout = async () => {
    setLoading(true);
    setAdminMode(false); // Clear admin mode on logout
    await supabase.auth.signOut();
    setUser(null);
    setUserRole(null);
    setLoading(false);
  };
  
  // This specific admin mode logic is kept if you need a quick way to simulate admin
  // but generally, admin role should come from Supabase user_metadata.
  const activateAdminMode = (active) => {
    setAdminMode(active);
    if (active) {
      setUser({ email: 'admin@dsltransport.com', user_metadata: { role: 'admin' } }); // Mock admin user
      setUserRole('admin');
    } else if (user && user.email === 'admin@dsltransport.com') { // Only reset if current user is the mock admin
      // This part needs to re-evaluate the actual session if one exists
      // For simplicity, if adminMode is turned off, we rely on onAuthStateChange to restore true state
      // or user needs to log in again.
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        setUserRole(session?.user?.user_metadata?.role ?? null);
      });
    }
  };

  const value = {
    user,
    userRole,
    loading,
    isAdmin: userRole === 'admin' || adminMode, // adminMode can override for dev
    isDriver: userRole === 'driver',
    isBroker: userRole === 'broker',
    login,
    register,
    logout,
    adminMode,
    setAdminMode: activateAdminMode // Use the new activateAdminMode
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

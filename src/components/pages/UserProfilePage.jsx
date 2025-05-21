
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { User, Mail, Phone, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const UserProfilePage = () => {
  const { user, userRole, adminMode } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', phone_number: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      if (!user && !adminMode) {
        toast({ title: "Error", description: "Not logged in.", variant: "destructive" });
        setLoading(false);
        return;
      }
      
      // If adminMode, use hardcoded details or a specific test user profile logic
      if(adminMode) {
        setProfile({
            email: 'admin@dsltransport.com',
            full_name: 'DSL Admin',
            phone_number: 'N/A (Static Admin)',
            role: 'admin'
        });
        setFormData({full_name: 'DSL Admin', phone_number: 'N/A (Static Admin)'});
        setLoading(false);
        return;
      }
      
      // Fetch for regular logged-in user
      if (user && user.id) {
        // Try fetching from 'drivers' table first if role is 'driver'
        let userProfileData = null;
        let userProfileError = null;

        if (userRole === 'driver') {
            const { data, error } = await supabase
                .from('drivers')
                .select('full_name, phone_number, email')
                .eq('user_id', user.id)
                .single();
            userProfileData = data;
            userProfileError = error;
        } else { // For admin/broker, or if driver profile not in 'drivers' table, check auth.users metadata
            const authUser = (await supabase.auth.getUser()).data.user;
            if (authUser) {
                 userProfileData = {
                    full_name: authUser.user_metadata?.full_name || user.email.split('@')[0],
                    email: authUser.email,
                    phone_number: authUser.user_metadata?.phone_number || '', // Assuming phone might be in metadata
                };
            }
        }
        
        if (userProfileError && userRole === 'driver') {
          toast({ title: "Error fetching profile", description: userProfileError.message, variant: "destructive" });
        } else if (userProfileData) {
          setProfile({ ...userProfileData, email: user.email, role: userRole });
          setFormData({ full_name: userProfileData.full_name || '', phone_number: userProfileData.phone_number || '' });
        } else {
          // Fallback if no specific profile found, use auth details
           setProfile({ email: user.email, full_name: user.email.split('@')[0], phone_number:'', role: userRole });
           setFormData({ full_name: user.email.split('@')[0], phone_number:'' });
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user, userRole, adminMode, toast]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (adminMode) {
        toast({title: "Static Admin", description: "Profile editing disabled for static admin.", variant: "default"});
        setEditing(false);
        return;
    }
    if (!user || !user.id) return;

    setLoading(true);
    
    // Update logic depends on where profile data is stored (auth metadata or specific table like 'drivers')
    let updateError = null;

    if (userRole === 'driver') {
        const { error } = await supabase
            .from('drivers')
            .update({ full_name: formData.full_name, phone_number: formData.phone_number })
            .eq('user_id', user.id);
        updateError = error;
    } else { // For admin/broker, update auth user_metadata
        const { error } = await supabase.auth.updateUser({
            data: { full_name: formData.full_name, phone_number: formData.phone_number }
        });
        updateError = error;
    }

    if (updateError) {
      toast({ title: "Error updating profile", description: updateError.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated successfully!" });
      setProfile(prev => ({ ...prev, ...formData }));
      setEditing(false);
    }
    setLoading(false);
  };

  if (loading && !profile) {
    return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div></div>;
  }

  if (!profile) {
    return <div className="text-center py-10">Could not load profile information.</div>;
  }

  return (
    <motion.div 
      className="max-w-2xl mx-auto space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Profile</h1>
        {!adminMode && (
            <Button variant="outline" onClick={() => setEditing(!editing)} disabled={adminMode}>
            <Edit3 className="mr-2 h-4 w-4" /> {editing ? 'Cancel' : 'Edit Profile'}
            </Button>
        )}
      </div>

      <div className="glass-effect p-6 rounded-lg shadow-lg">
        {!editing ? (
          <div className="space-y-4">
            <ProfileDetail icon={<User />} label="Full Name" value={profile.full_name} />
            <ProfileDetail icon={<Mail />} label="Email" value={profile.email} />
            <ProfileDetail icon={<Phone />} label="Phone Number" value={profile.phone_number || 'Not set'} />
            <ProfileDetail icon={<User />} label="Role" value={profile.role?.charAt(0).toUpperCase() + profile.role?.slice(1)} />
          </div>
        ) : (
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium mb-1">Full Name</label>
              <input type="text" id="full_name" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="w-full px-3 py-2 rounded-md border bg-background" />
            </div>
            <div>
              <label htmlFor="phone_number" className="block text-sm font-medium mb-1">Phone Number</label>
              <input type="tel" id="phone_number" value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} className="w-full px-3 py-2 rounded-md border bg-background" />
            </div>
            <div className="text-right">
              <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
            </div>
          </form>
        )}
      </div>
    </motion.div>
  );
};

const ProfileDetail = ({ icon, label, value }) => (
  <div className="flex items-start">
    <span className="text-primary mr-3 mt-1">{icon}</span>
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  </div>
);

export default UserProfilePage;

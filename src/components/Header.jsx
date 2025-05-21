// /src/components/Header.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, userRole, setAdminMode, adminMode } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    console.debug('[Header] useEffect triggered with user:', user, 'adminMode:', adminMode);
    if (user && !adminMode) {
      fetchNotifications();
      const channel = supabase.channel('realtime-notifications')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, payload => {
          console.debug('[Header] New notification received:', payload.new);
          setNotifications(prev => [payload.new, ...prev]);
          setUnreadCount(prev => prev + (payload.new.is_read ? 0 : 1));
        })
        .subscribe();
      return () => supabase.removeChannel(channel);
    } else if (adminMode) {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user, adminMode]);

  const fetchNotifications = async () => {
    if (!user || !user.id) return;
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);
    if (error) console.error("Error fetching notifications", error);
    else {
      console.debug('[Header] Fetched notifications:', data);
      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
    }
  };

  const handleLogout = async () => {
    console.debug('[Header] Logging out user');
    setAdminMode(false);
    await supabase.auth.signOut();
    navigate('/login');
  };

  const toggleMenu = () => setIsOpen(!isOpen);

  const navLinks = [
    { label: 'Dashboard', path: '/' },
    ...(userRole === 'admin' ? [
      { label: 'Driver View', path: '/driver-dashboard' },
      { label: 'Broker View', path: '/broker-dashboard' },
      { label: 'Payroll', path: '/payroll' },
      { label: 'Vehicles', path: '/vehicles' },
      { label: 'Maintenance', path: '/maintenance' },
    ] : []),
    { label: 'Profile', path: '/profile' }
  ];

  const markAsRead = async (notificationId) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
    if (!error) {
      console.debug('[Header] Marked notification as read:', notificationId);
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  return (
    <header className="glass-effect sticky top-0 z-40 shadow-md" style={{ '--header-height': '4rem' }}>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src="/dsl-logo-wht.png" alt="DSL Transport Logo" className="h-8 w-auto" />
          <span className="text-xl font-bold hidden sm:inline">DSL Transport</span>
        </Link>

        <nav className="hidden md:flex items-center gap-4">
          {navLinks.map(link => (
            <Button key={link.label} variant="ghost" asChild>
              <Link to={link.path}>{link.label}</Link>
            </Button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user && (
            <div className="relative">
              <Button variant="ghost" size="icon" onClick={() => setShowNotifications(s => !s)}>
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </Button>
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto"
                  >
                    <div className="p-3 border-b border-border">
                      <h4 className="font-semibold">Notifications</h4>
                    </div>
                    {notifications.length === 0 ? (
                      <p className="p-4 text-sm text-muted-foreground">No new notifications.</p>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          className={`p-3 border-b border-border/50 text-sm hover:bg-muted/30 ${!n.is_read ? 'font-semibold' : ''}`}
                          onClick={() => !n.is_read && markAsRead(n.id)}
                        >
                          <p>{n.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString()}</p>
                        </div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          <span className="text-sm text-muted-foreground hidden lg:inline">{user?.email || (adminMode ? 'admin@dsltransport.com' : '')}</span>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMenu}>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-effect border-t border-border"
          >
            <nav className="flex flex-col p-4 space-y-2">
              {navLinks.map(link => (
                <Button key={link.label} variant="ghost" className="justify-start" asChild onClick={toggleMenu}>
                  <Link to={link.path}>{link.label}</Link>
                </Button>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;

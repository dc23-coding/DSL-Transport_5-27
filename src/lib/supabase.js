import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY;

// Only log in development
if (import.meta.env.DEV) {
  console.log('🧠 Supabase URL:', supabaseUrl);
  console.log('🧠 Supabase Anon Key:', supabaseAnonKey ? 'Present' : 'Missing');
  console.log('🧠 Supabase Service Key:', supabaseServiceKey ? 'Present' : 'Missing');
}

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xoeocjtdxfvfbnxbxznq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvZW9janRkeGZ2ZmJueGJ4em5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MTUxNTIsImV4cCI6MjA2MjM5MTE1Mn0.ifVg4LgihX41jx8CDPGCuiyv9H1AR4QKquozrWSKuhE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

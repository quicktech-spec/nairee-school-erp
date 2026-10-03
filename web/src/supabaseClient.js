import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://tspaqgkwnecfvncnqxjs.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzcGFxZ2t3bmVjZnZuY25xeGpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEwNDk0ODQsImV4cCI6MjEwNjYyNTQ4NH0.WzVdMC75SXLFhzqNG4d4YCg4mZQ-IgwC0YcWVaj_nVk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

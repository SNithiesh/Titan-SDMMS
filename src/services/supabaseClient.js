import { createClient } from '@supabase/supabase-js';

// Replace these two variables with your actual Supabase Project URL and Anon Key
// from https://supabase.com -> Project Settings -> API
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://YOUR_SUPABASE_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const isSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return Boolean(url && key && !url.includes('YOUR_SUPABASE_PROJECT_ID'));
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Real-time subscription for live complaint updates across all devices
 * Frontend subscribes directly to Supabase (read-only anon key — safe)
 * All writes go through the secure Express backend
 */
export function subscribeToRealtimeComplaints(onChangeCallback) {
  if (!isSupabaseConfigured()) return () => {};

  const subscription = supabase
    .channel('public:complaints')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, (payload) => {
      onChangeCallback(payload);
    })
    .subscribe();

  return () => { supabase.removeChannel(subscription); };
}

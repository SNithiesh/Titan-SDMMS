import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('[DB] Supabase not configured — running in offline/demo mode');
}

// Server-side Supabase client uses the SERVICE ROLE KEY
// This key bypasses Row Level Security — stays on server only, NEVER sent to frontend
export const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export const isDbConnected = () => !!supabase;

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://psfhiaipjxzakpnwgume.supabase.co';
const supabaseKey = process.env.SUPABASE_SECRET_KEY || '';

if (!supabaseKey) {
  console.warn('⚠️ SUPABASE_SECRET_KEY is not set in environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

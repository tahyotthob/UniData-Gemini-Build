
import { createClient } from '@supabase/supabase-js';

// These should be set in your deployment environment (Vercel, Netlify, etc.)
const supabaseUrl = process.env.SUPABASE_URL || 'https://lseudzwaxcljxaazlexe.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable__ne7x2Rd69qCTmeuwGbZwg_QPmM8TUh';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials missing. Signup will use mock service.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

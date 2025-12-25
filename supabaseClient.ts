
import { createClient } from '@supabase/supabase-js';

/**
 * Initialization logic for Supabase. 
 * Priority: 1. Environment Variables, 2. Hardcoded Fallbacks.
 */
const supabaseUrl = process.env.SUPABASE_URL || 'https://lseudzwaxcljxaazlexe.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzZXVkendheGNsanhhYXpsZXhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1ODE2NjMsImV4cCI6MjA4MjE1NzY2M30.uQyy49L_vw9YHl0FVhZN7_gJ9pbiNgYNa4QhCUWrCW0';

if (!supabaseUrl || supabaseUrl.includes('your-project')) {
  console.warn("Unidata: Supabase is not configured with a valid project URL.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

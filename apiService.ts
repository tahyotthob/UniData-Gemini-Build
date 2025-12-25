
import { supabase } from './supabaseClient';

/**
 * Persists the user's email and role to the Supabase 'waitlist' table.
 */
export const subscribeToWaitlist = async (email: string, role: string) => {
  console.log(`[Unidata] Attempting to subscribe: ${email} (${role})`);

  try {
    // Attempt to insert into the 'waitlist' table
    const { data, error } = await supabase
      .from('waitlist')
      .insert([{ email, role }]);

    if (error) {
      console.error('[Supabase Error Log]:', error);
      
      // 1. Check for Duplicate Email (Unique Constraint)
      if (error.code === '23505') {
        throw new Error("This email is already registered on our waitlist!");
      }
      
      // 2. Check for Missing Table
      if (error.code === '42P01') {
        throw new Error("Database configuration error: 'waitlist' table not found. Please run the SQL setup script.");
      }
      
      // 3. Check for RLS Permission Issues
      if (error.message.toLowerCase().includes('policy') || error.code === '42501') {
        throw new Error("Database permission error: Please enable the 'Insert' policy for anonymous users in your Supabase dashboard.");
      }

      // 4. General fallback
      throw new Error(error.message || "Failed to join the waitlist. Please try again later.");
    }

    console.log('[Unidata] Successfully added to waitlist.');
    return { success: true, data };

  } catch (err: any) {
    console.error('[Unidata] Connection Error:', err.message);
    throw err;
  }
};


import { supabase } from './supabaseClient';

/**
 * Persists the user's email and role to the Supabase 'waitlist' table.
 */
export const subscribeToWaitlist = async (email: string, role: string) => {
  // If no Supabase credentials, fallback to mock for development
  if (!process.env.SUPABASE_URL) {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`[MOCK] Stored: ${email} (${role})`);
        resolve({ success: true });
      }, 1000);
    });
  }

  const { data, error } = await supabase
    .from('waitlist')
    .insert([{ email, role }]);

  if (error) {
    // Handle unique constraint violation (email already exists)
    if (error.code === '23505') {
      throw new Error("This email is already on our waitlist!");
    }
    throw error;
  }

  return { success: true, data };
};


import { supabase } from './supabaseClient';
import { UserProfile } from './types';

/**
 * Persists user registration data to the Supabase 'profiles' table.
 */
export const registerUser = async (profile: UserProfile) => {
  console.log(`[Unidata] Attempting registration for: ${profile.email}`);

  const payload = {
    email: profile.email,
    role: profile.role,
    name: profile.name,
    course: profile.course,
    university: profile.university,
    age_range: profile.ageRange,
    gender: profile.gender,
    state: profile.state,
    education: profile.education,
    employment: profile.employment
  };

  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert([payload], { onConflict: 'email' });

    if (error) {
      console.error('[Supabase Error Log]:', error);
      if (error.code === '23505') {
        throw new Error("This email is already registered on our waitlist.");
      }
      throw new Error(error.message || "Registration failed. Please check your connection.");
    }

    return { success: true, data };
  } catch (err: any) {
    console.error('[Unidata] Registration Error:', err.message);
    throw err;
  }
};

/**
 * Admin: Fetch all registered users
 */
export const fetchAllProfiles = async (): Promise<UserProfile[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching profiles:', error);
    return [];
  }

  // Map snake_case from DB back to camelCase for the UI
  return (data || []).map(row => ({
    id: row.id,
    email: row.email,
    role: row.role as any,
    name: row.name,
    course: row.course,
    university: row.university,
    ageRange: row.age_range,
    gender: row.gender,
    state: row.state,
    education: row.education,
    employment: row.employment
  }));
};

/**
 * Unified helper for waitlist and account creation
 */
export const subscribeToWaitlist = async (email: string, role: string, extraData: Partial<UserProfile> = {}) => {
  return registerUser({ email, role: role as any, ...extraData });
};


import { supabase } from './supabaseClient';
import { UserProfile, SurveyCampaign } from './types';

const rowToProfile = (row: any): UserProfile => ({
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
});

/** Returns the signed-in user's profile, or null if they haven't completed one yet. */
export const fetchMyProfile = async (email: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase.from('profiles').select('*').ilike('email', email).maybeSingle();
  if (error) throw error;
  return data ? rowToProfile(data) : null;
};

export const fetchIsAdmin = async (): Promise<boolean> => {
  const { data, error } = await supabase.rpc('is_admin');
  return !error && data === true;
};

/** Saves the signed-in user's profile. The email always comes from the verified session. */
export const registerUser = async (profile: UserProfile) => {
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser?.email) throw new Error('Please verify your email first.');
  const payload = {
    email: authUser.email,
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

    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    throw err;
  }
};

/**
 * Creates a new survey campaign
 */
export const createCampaign = async (campaign: Partial<SurveyCampaign>) => {
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) throw new Error('Please sign in first.');
  const { data, error } = await supabase
    .from('campaigns')
    .insert([{ ...campaign, researcher_id: authUser.id }]);

  if (error) throw error;
  return data;
};

/** Matching is done in SQL (matched_campaigns) so respondents never download campaigns they aren't targeted by. */
export const fetchMatchedSurveys = async (_user: UserProfile): Promise<SurveyCampaign[]> => {
  const { data, error } = await supabase.rpc('matched_campaigns');
  if (error) throw error;
  return (data || []) as SurveyCampaign[];
};

/** Admin only: enforced by RLS (profiles_admin_select). */
export const fetchAllProfiles = async (): Promise<UserProfile[]> => {
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(rowToProfile);
};


import { supabase } from './supabaseClient';
import { UserProfile, SurveyCampaign } from './types';

export const registerUser = async (profile: UserProfile) => {
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
  const { data, error } = await supabase
    .from('campaigns')
    .insert([campaign]);

  if (error) throw error;
  return data;
};

/**
 * Matching Engine Logic: Fetches surveys compatible with a specific respondent
 */
export const fetchMatchedSurveys = async (user: UserProfile): Promise<SurveyCampaign[]> => {
  // In a real production app, we would use Supabase .contains() filters.
  // For this MVP, we fetch active campaigns and filter in the engine.
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return [];

  return (data || []).filter(camp => {
    const stateMatch = camp.target_states.length === 0 || camp.target_states.includes(user.state);
    const genderMatch = camp.target_genders.length === 0 || camp.target_genders.includes(user.gender);
    const ageMatch = camp.target_age_ranges.length === 0 || camp.target_age_ranges.includes(user.ageRange);
    return stateMatch && genderMatch && ageMatch;
  });
};

export const fetchAllProfiles = async (): Promise<UserProfile[]> => {
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
  if (error) return [];
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

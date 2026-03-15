
import { supabase } from './supabaseClient';
import { UserProfile, SurveyCampaign, SurveyResponse } from './types';

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
    .insert([campaign])
    .select();

  if (error) throw error;
  return data;
};

/**
 * Matching Engine: Fetches surveys compatible with a respondent's profile
 */
export const fetchMatchedSurveys = async (user: UserProfile): Promise<SurveyCampaign[]> => {
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

/**
 * Fetches all surveys created by a specific researcher
 */
export const fetchResearcherSurveys = async (researcherId: string): Promise<SurveyCampaign[]> => {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('researcher_id', researcherId)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data || [];
};

/**
 * Fetches a single survey by ID
 */
export const fetchSurveyById = async (surveyId: string): Promise<SurveyCampaign | null> => {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', surveyId)
    .single();

  if (error) return null;
  return data;
};

/**
 * Fetches all responses for a given survey
 */
export const fetchSurveyResponses = async (surveyId: string): Promise<SurveyResponse[]> => {
  const { data, error } = await supabase
    .from('responses')
    .select('*')
    .eq('survey_id', surveyId)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data || [];
};

/**
 * Submits a survey response
 */
export const submitSurveyResponse = async (
  surveyId: string,
  respondentId: string,
  answers: Record<string, string | number>
): Promise<{ success: boolean; error?: string }> => {
  const { error } = await supabase
    .from('responses')
    .insert([{
      survey_id: surveyId,
      respondent_id: respondentId,
      answers,
    }]);

  if (error) return { success: false, error: error.message };
  return { success: true };
};

/**
 * Check if a respondent has already responded to a survey
 */
export const hasRespondedToSurvey = async (
  surveyId: string,
  respondentId: string
): Promise<boolean> => {
  const { data, error } = await supabase
    .from('responses')
    .select('id')
    .eq('survey_id', surveyId)
    .eq('respondent_id', respondentId)
    .limit(1);

  if (error) return false;
  return (data || []).length > 0;
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

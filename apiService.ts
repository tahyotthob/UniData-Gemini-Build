
import { supabase } from './supabaseClient';
import { UserProfile, SurveyCampaign, SurveyQuestion, PublicSurvey, SurveyAnswer } from './types';

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
    .insert([{ ...campaign, researcher_id: authUser.id }])
    .select('id, share_slug')
    .single();

  if (error) throw error;
  return data as { id: string; share_slug: string };
};

/** The signed-in researcher's campaigns with response counts (RLS limits this to their own). */
export const fetchMyCampaigns = async (): Promise<SurveyCampaign[]> => {
  const { data, error } = await supabase
    .from('campaigns')
    .select('id, title, share_slug, status, created_at, responses(count)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((row: any) => ({
    ...row,
    response_count: row.responses?.[0]?.count ?? 0
  })) as SurveyCampaign[];
};

export const setCampaignStatus = async (id: string, status: 'open' | 'closed') => {
  const { error } = await supabase.from('campaigns').update({ status }).eq('id', id);
  if (error) throw error;
};

/** Public: loads a survey by its share slug (no login needed). */
export const fetchPublicSurvey = async (slug: string): Promise<PublicSurvey | null> => {
  const { data, error } = await supabase.rpc('get_public_survey', { p_slug: slug });
  if (error) throw error;
  return (data && data[0]) || null;
};

/** Public: submits answers. Anonymous respondents are de-duplicated by a per-browser token. */
export const submitSurveyResponse = async (slug: string, answers: SurveyAnswer[]) => {
  let token = '';
  try {
    token = localStorage.getItem('unidata_respondent_token') || '';
    if (!token) {
      token = crypto.randomUUID();
      localStorage.setItem('unidata_respondent_token', token);
    }
  } catch { token = crypto.randomUUID(); }
  const { error } = await supabase.rpc('submit_response', { p_slug: slug, p_token: token, p_answers: answers });
  if (error) throw error;
};

/** Researcher: downloads responses of one of their campaigns as rows (RLS-protected). */
export const fetchResponses = async (campaignId: string) => {
  const { data, error } = await supabase
    .from('responses')
    .select('answers, created_at')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []) as { answers: SurveyAnswer[]; created_at: string }[];
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

/** Researcher: question texts of one of their campaigns (for CSV headers). */
export const fetchMyCampaignQuestions = async (campaignId: string): Promise<string[]> => {
  const { data, error } = await supabase.from('campaigns').select('questions').eq('id', campaignId).single();
  if (error) throw error;
  return ((data?.questions || []) as SurveyQuestion[]).map(q => q.question);
};

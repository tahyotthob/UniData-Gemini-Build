
export interface SurveyQuestion {
  question: string;
  type: 'multiple_choice' | 'short_answer' | 'rating';
  options?: string[];
  rationale?: string;
}

export type UserRole = 'researcher' | 'respondent';

export interface UserProfile {
  id?: string;
  email: string;
  role: UserRole;
  name?: string;
  course?: string;
  university?: string;
  ageRange?: string;
  gender?: string;
  state?: string;
  education?: string;
  employment?: string;
}

export interface SurveyCampaign {
  id: string;
  researcher_id?: string;
  title: string;
  questions: SurveyQuestion[];
  target_states: string[];
  target_genders: string[];
  target_age_ranges: string[];
  reward: number;
  share_slug?: string;
  status?: 'open' | 'closed';
  response_count?: number;
  created_at?: string;
}

export interface Testimonial {
  name: string;
  role: string;
  institution: string;
  content: string;
  image?: string;
  color?: string;
}

export interface PublicSurvey {
  id: string;
  title: string;
  questions: SurveyQuestion[];
  status: 'open' | 'closed';
}

/** One answer per question, in question order. Ratings are 1-5. */
export type SurveyAnswer = string | number | null;

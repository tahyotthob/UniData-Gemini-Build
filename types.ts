
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

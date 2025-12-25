
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
  // Researcher specific
  name?: string;
  course?: string;
  university?: string;
  // Respondent specific
  ageRange?: string;
  gender?: string;
  state?: string;
  education?: string;
  employment?: string;
}

export interface Testimonial {
  name: string;
  role: string;
  institution: string;
  content: string;
  image?: string;
  color?: string;
}

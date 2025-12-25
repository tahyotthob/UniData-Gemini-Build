
export interface SurveyQuestion {
  question: string;
  type: 'multiple_choice' | 'short_answer' | 'rating';
  options?: string[];
  rationale?: string;
}

export interface UserRole {
  id: 'student' | 'respondent';
  label: string;
}

export interface Testimonial {
  name: string;
  role: string;
  institution: string;
  content: string;
  image?: string;
  color?: string;
}

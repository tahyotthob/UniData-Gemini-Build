import { SurveyQuestion } from './types';
import { supabase, supabaseUrl, supabaseAnonKey } from './supabaseClient';

/**
 * Client for the server-side AI proxy (supabase/functions/ai).
 * No AI provider SDK or key lives in the browser.
 */
const AI_URL = import.meta.env.VITE_AI_URL || `${supabaseUrl}/functions/v1/ai`;

async function callAi<T>(task: string, payload: unknown): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const { data: { session } } = await supabase.auth.getSession();
  headers.apikey = supabaseAnonKey;
  // Signed-in users get a personal quota; visitors fall back to the anon key and a small IP quota.
  headers.Authorization = `Bearer ${session?.access_token ?? supabaseAnonKey}`;
  const res = await fetch(AI_URL, { method: 'POST', headers, body: JSON.stringify({ task, payload }) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `AI request failed (${res.status})`);
  return data as T;
}

export interface ChatMessage { role: 'user' | 'assistant'; content: string; }
export interface ChatToolCall { name: string; args: Record<string, any>; }
export interface ChatContext {
  topic: string;
  variables: string;
  demographics: string;
  questions: SurveyQuestion[];
}

export const analyzeResearchContext = async (text: string): Promise<{ variables: string; demographics: string }> => {
  try {
    return await callAi('analyze-context', { text });
  } catch {
    return { variables: '', demographics: '' };
  }
};

export const generateSurveyQuestions = async (
  topic: string,
  keywords?: string,
  demographics?: string,
  preferredTypes?: string[],
  proposalText?: string,
): Promise<SurveyQuestion[]> => {
  const { questions } = await callAi<{ questions: SurveyQuestion[] }>('generate-questions', {
    topic, keywords, demographics, preferredTypes, proposalText,
  });
  return questions;
};

export const analyzeQualityAndBias = async (
  questions: SurveyQuestion[],
): Promise<{ score: number; findings: string[]; suggestions: string[] }> => {
  try {
    return await callAi('audit-bias', { questions });
  } catch {
    return { score: 0, findings: [], suggestions: [] };
  }
};

/** Sends the running conversation; the caller keeps the history. */
export const sendResearchChat = (context: ChatContext, messages: ChatMessage[]) =>
  callAi<{ text: string; toolCalls: ChatToolCall[] }>('chat', { context, messages });

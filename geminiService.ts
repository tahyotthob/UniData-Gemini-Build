
import { GoogleGenAI, Type } from "@google/genai";
import { SurveyQuestion } from "./types";

export const generateSurveyQuestions = async (
  topic: string,
  keywords?: string,
  demographics?: string
): Promise<SurveyQuestion[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

  try {
    let prompt = `Generate 3 high-quality survey questions for a research project on: "${topic}".`;
    if (keywords) prompt += ` Ensure the questions touch on these key themes: ${keywords}.`;
    if (demographics) prompt += ` The target audience is: ${demographics}.`;
    prompt += ` Optimized for Nigerian academic standards.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              type: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["question", "type"]
          }
        }
      }
    });

    const text = response.text || "[]";
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating questions:", error);
    throw error;
  }
};

/**
 * Generates a personalized welcome email draft to show the user 
 * or to send via your email provider.
 */
export const generateWelcomeDraft = async (role: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const roleContext = role === 'student' 
    ? 'a Researcher (Student/Academic) looking for verified survey respondents' 
    : 'a Respondent looking to earn rewards by participating in research';

  const prompt = `Write a short, exciting welcome email (max 100 words) for a new user joining Unidata. 
  The user is ${roleContext}. 
  Mention that Unidata is Nigeria's first AI-driven research ecosystem. 
  Use a professional yet friendly Nigerian tone (e.g., using words like 'Welcome on board').`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "Welcome to Unidata!";
  } catch (error) {
    return "Welcome to Unidata! We're excited to have you on board.";
  }
};

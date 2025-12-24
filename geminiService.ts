
import { GoogleGenAI, Type } from "@google/genai";
import { SurveyQuestion } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateSurveyQuestions = async (
  topic: string,
  keywords?: string,
  demographics?: string
): Promise<SurveyQuestion[]> => {
  try {
    let prompt = `Generate 3 high-quality survey questions for a research project on: "${topic}".`;
    
    if (keywords) {
      prompt += ` Ensure the questions touch on these key themes: ${keywords}.`;
    }
    
    if (demographics) {
      prompt += ` The target audience for this survey is: ${demographics}. Tailor the language and context to this specific group.`;
    }

    prompt += ` The questions should be optimized for Nigerian respondents and academic research standards.`;

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
              type: { 
                type: Type.STRING,
                description: "The type of the question: multiple_choice, short_answer, or rating"
              },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Options for multiple choice questions, if applicable"
              }
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

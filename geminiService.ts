
import { GoogleGenAI, Type } from "@google/genai";
import { SurveyQuestion } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * Acts as a Research Consultant to extract variables and demographics from a topic or proposal.
 */
export const analyzeResearchContext = async (text: string): Promise<{ variables: string, demographics: string }> => {
  try {
    const prompt = `You are a Senior Academic Research Consultant specializing in Nigerian higher education and market research. 
    Analyze the following research objective or proposal snippet and suggest:
    1. A list of 3-5 key variables or themes (comma-separated).
    2. A concise description of the target demographics (who should answer this?).

    Research Text: "${text}"`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are a helpful academic consultant. Be precise and relevant to the Nigerian context.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            variables: { type: Type.STRING, description: "Key variables or themes extracted." },
            demographics: { type: Type.STRING, description: "Target audience description." }
          },
          required: ["variables", "demographics"]
        }
      }
    });

    return JSON.parse(response.text || '{"variables":"", "demographics":""}');
  } catch (error) {
    console.error("Context Analysis Error:", error);
    return { variables: "", demographics: "" };
  }
};

/**
 * Generates initial survey questions with rationale.
 */
export const generateSurveyQuestions = async (
  topic: string,
  keywords?: string,
  demographics?: string,
  preferredTypes?: string[],
  proposalText?: string
): Promise<SurveyQuestion[]> => {
  try {
    const prompt = `Act as a Senior Research Consultant and Academic Advisor. 
    A researcher is working on: "${topic}".
    ${proposalText ? `They have uploaded a proposal: "${proposalText.substring(0, 1500)}..."` : ''}
    Key Themes to measure: ${keywords || 'general study variables'}
    Target Population: ${demographics || 'general Nigerian population'}
    Requested Question Formats: ${preferredTypes?.join(', ') || 'multiple_choice, short_answer'}
    
    Task:
    1. Generate 4 high-quality survey questions that align with Nigerian academic standards.
    2. For each question, provide a conversational "rationale" explaining why this question is scientifically valuable for their specific topic.
    3. Ensure the questions are clear, non-leading, and easy for the target audience to understand.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are a guiding research expert. Your tone is supportive, expert, and academic yet accessible.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              type: { 
                type: Type.STRING, 
                description: "Must be one of: multiple_choice, short_answer, rating" 
              },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Provide options if type is multiple_choice."
              },
              rationale: { 
                type: Type.STRING, 
                description: "A helpful explanation of the research value of this specific question." 
              }
            },
            required: ["question", "type", "rationale"]
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Survey Generation Error:", error);
    throw error;
  }
};

/**
 * Refines existing questions based on user feedback.
 */
export const refineSurveyQuestions = async (
  previousQuestions: SurveyQuestion[],
  feedback: string
): Promise<SurveyQuestion[]> => {
  try {
    const prompt = `I am a researcher and I have these draft questions: ${JSON.stringify(previousQuestions)}
    
    My feedback/request for refinement is: "${feedback}"
    
    As my Research Consultant, please update the survey questions based on this feedback. 
    Maintain the high academic standard and provide updated rationales.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are an iterative research partner. Listen to the feedback and improve the methodology accordingly.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              type: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              rationale: { type: Type.STRING }
            },
            required: ["question", "type", "rationale"]
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Refinement Error:", error);
    throw error;
  }
};


import { GoogleGenAI, Type } from "@google/genai";
import { SurveyQuestion } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * Acts as a Research Consultant to extract variables and demographics from a topic or proposal.
 */
export const analyzeResearchContext = async (text: string): Promise<{ variables: string, demographics: string }> => {
  try {
    const prompt = `You are a Senior Academic Research Consultant specializing in Nigerian higher education and market research. 
    Review the following research objective or proposal snippet.
    
    Research Objective: "${text}"
    
    Based on your expertise, please suggest:
    1. A list of 3-5 key variables or themes that are critical to measure for this specific study (comma-separated).
    2. A precise description of the target demographics in the Nigerian context (e.g., 'Final year undergraduates in Lagos state', 'Small business owners in Onitsha').
    
    Ensure your response is in JSON format.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are a helpful and expert academic consultant. Your goal is to guide the user towards a robust research methodology. Be precise and contextually relevant to Nigeria.",
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
    The researcher is exploring: "${topic}".
    ${proposalText ? `They have uploaded a detailed proposal: "${proposalText.substring(0, 1500)}..."` : ''}
    
    Key Metrics to observe: ${keywords || 'general study variables'}
    Target Population: ${demographics || 'general Nigerian population'}
    Requested Question Formats: ${preferredTypes?.join(', ') || 'multiple_choice, short_answer'}
    
    Task:
    1. Generate 4 high-quality survey questions that follow international academic best practices but are adapted for Nigerian clarity.
    2. For each question, provide a guiding "rationale" explaining why this question is scientifically valuable for their specific topic and how it links to their variables.
    3. Ensure the questions are clear, avoid double-barreled phrasing, and are non-leading.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are a guiding research expert. Your tone is supportive, expert, and academic yet conversational. Help the user understand the 'why' behind the survey design.",
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
                description: "Provide options if the question type is multiple_choice."
              },
              rationale: { 
                type: Type.STRING, 
                description: "A supportive, educational explanation of why this question matters to the study." 
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
    const prompt = `I have reviewed your draft questions: ${JSON.stringify(previousQuestions)}
    
    The user has requested the following refinement: "${feedback}"
    
    As our Research Consultant, please revise the questions to address this feedback. 
    Maintain high academic standards, ensure logical flow, and update the rationales to explain how the new questions improve the study.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are an iterative research partner. You listen carefully to feedback and improve survey methodology to make it more precise and actionable.",
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

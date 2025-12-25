
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { SurveyQuestion } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * Define tool for the AI to interact with the application state.
 */
export const updateQuestionTool: FunctionDeclaration = {
  name: 'update_question',
  parameters: {
    type: Type.OBJECT,
    description: 'Update a specific survey question in the research draft.',
    properties: {
      index: {
        type: Type.NUMBER,
        description: 'The 0-based index of the question to update.',
      },
      questionText: {
        type: Type.STRING,
        description: 'The new text for the question.',
      },
      type: {
        type: Type.STRING,
        description: 'The type of question (multiple_choice, short_answer, rating).',
      },
      options: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'The options for multiple choice questions.',
      },
      rationale: {
        type: Type.STRING,
        description: 'Updated scientific rationale for this question.',
      }
    },
    required: ['index'],
  },
};

export const DR_UNIDATA_SYSTEM_INSTRUCTION = (topic: string, variables: string, demographics: string, currentQuestions: SurveyQuestion[]) => `
You are Dr. Unidata, a Senior Research Methodologist and world-class expert in survey design, specifically tailored to the Nigerian academic and market research landscape.

CONTEXT OF THE STUDY:
- Topic: ${topic}
- Core Variables: ${variables}
- Target Demographics: ${demographics}
- Current Instrument Draft: ${JSON.stringify(currentQuestions)}

YOUR MANDATE:
1. COLLABORATIVE EDITOR: When the user asks for changes, USE the 'update_question' tool to apply them in real-time. If they say "make Q1 more professional", rewrite it and call the tool.
2. METHODOLOGICAL ADVISOR: Don't just follow orders. If a user asks for a leading question, explain *why* it introduces bias and suggest a neutral alternative.
3. SURVEY BEST PRACTICES: 
   - Encourage Likert scales (Strongly Disagree to Strongly Agree) for measuring attitudes.
   - Avoid double-barreled questions (asking two things at once).
   - Ensure language is accessible but academic.
4. NIGERIAN CONTEXT: Suggest nuances specific to Nigeria (e.g., considering mobile-first users, data connectivity constraints, or specific cultural sensitivities).
5. CONVERSATIONAL VOICE: If the user is speaking to you via audio, keep your spoken responses concise but expert.

Always be supportive, rigorous, and scientific. Your goal is to help the researcher produce a Chapter 3 (Methodology) that is bulletproof.
`;

export const analyzeResearchContext = async (text: string): Promise<{ variables: string, demographics: string }> => {
  try {
    const prompt = `You are a Senior Academic Research Consultant. Review: "${text}". Suggest 3-5 variables and target demographics in JSON.`;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "Expert academic consultant for Nigeria. Output valid JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            variables: { type: Type.STRING },
            demographics: { type: Type.STRING }
          },
          required: ["variables", "demographics"]
        }
      }
    });
    return JSON.parse(response.text || '{"variables":"", "demographics":""}');
  } catch (error) {
    return { variables: "", demographics: "" };
  }
};

export const generateSurveyQuestions = async (
  topic: string,
  keywords?: string,
  demographics?: string,
  preferredTypes?: string[],
  proposalText?: string
): Promise<SurveyQuestion[]> => {
  try {
    const prompt = `Draft 4 high-quality survey questions for: "${topic}". Variables: ${keywords}. Audience: ${demographics}. Formats: ${preferredTypes?.join(',')}. Provide options for multiple_choice.`;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are a survey design expert. Ensure high academic quality and clarity.",
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
    throw error;
  }
};

export const analyzeQualityAndBias = async (questions: SurveyQuestion[]): Promise<{ score: number, findings: string[], suggestions: string[] }> => {
  try {
    const prompt = `Audit these questions for bias: ${JSON.stringify(questions)}`;
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        systemInstruction: "Critical Research Auditor. Focus on neutrality and clarity.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            findings: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["score", "findings", "suggestions"]
        }
      }
    });
    return JSON.parse(response.text || '{"score":0, "findings":[], "suggestions":[]}');
  } catch (error) {
    return { score: 0, findings: [], suggestions: [] };
  }
};

export const createResearchChat = (topic: string, variables: string, demographics: string, currentQuestions: SurveyQuestion[]) => {
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      tools: [{ functionDeclarations: [updateQuestionTool] }],
      systemInstruction: DR_UNIDATA_SYSTEM_INSTRUCTION(topic, variables, demographics, currentQuestions),
    }
  });
};

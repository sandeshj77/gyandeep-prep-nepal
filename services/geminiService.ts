
import { GoogleGenAI, Type } from "@google/genai";
import { Question, UserAnswer, AIAnalysisReport, Difficulty } from "../types";

/**
 * Analyzes quiz performance data using Gemini 3 Flash.
 */
export const analyzePerformance = async (
  questions: Question[],
  userAnswers: UserAnswer[]
): Promise<AIAnalysisReport | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const performanceSummary = userAnswers.map((ua) => {
      const q = questions.find(item => item.id === ua.questionId);
      return {
        question: q?.question,
        category: q?.category,
        isCorrect: ua.selectedOption === q?.correctAnswer,
        timeTaken: ua.timeTaken
      };
    });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are an expert Nepal Exam preparation mentor. Analyze this student's quiz data and provide a structured JSON analysis: ${JSON.stringify(performanceSummary)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of areas where the student performed well." },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific topics or skills needing improvement." },
            patterns: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Observations on user behavior (e.g., rushing through hard questions)." },
            timeManagement: { type: Type.STRING, description: "Advice on pacing." },
            actionPlan: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3-5 concrete steps for the next study session." },
            motivationalMessage: { type: Type.STRING, description: "A supportive closing in both English and Nepali." }
          },
          required: ["strengths", "weaknesses", "patterns", "timeManagement", "actionPlan", "motivationalMessage"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return null;
  }
};

/**
 * Generates MCQs based on a specific topic.
 */
export const generateAIQuestions = async (
  topic: string,
  count: number = 5,
  difficulty: Difficulty = 'Medium'
): Promise<Question[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate ${count} professional MCQs for Nepal Loksewa or Banking exams about the topic: "${topic}". Difficulty level: ${difficulty}. Ensure all facts are accurate for Nepal.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING }, minItems: 4, maxItems: 4 },
              correctAnswer: { type: Type.INTEGER, description: "Index (0-3) of the correct option." },
              explanation: { type: Type.STRING },
              difficulty: { type: Type.STRING },
              type: { type: Type.STRING, description: "Sub-topic name" }
            },
            required: ["question", "options", "correctAnswer", "explanation", "difficulty", "type"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    const results = JSON.parse(text);
    return results.map((r: any) => ({
      ...r,
      id: `ai-${Math.random().toString(36).substr(2, 9)}`,
      category: 'ai_generated'
    }));
  } catch (error) {
    console.error("AI Question Generation failed:", error);
    throw error;
  }
};

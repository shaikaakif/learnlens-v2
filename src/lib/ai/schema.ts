import { Type, Schema } from '@google/genai';

// Construct the exact structure using the @google/genai Type enum
export const GeminiLearningMRISchema: Schema = {
  type: Type.OBJECT,
  properties: {
    subjectDetected: { type: Type.STRING, description: "Mathematics, English, Science, Social Science, Hindi, Telugu, Computer Science, Other, or Mixed" },
    score: {
      type: Type.OBJECT,
      properties: {
        obtained: { type: Type.NUMBER, nullable: true },
        total: { type: Type.NUMBER, nullable: true },
        source: { type: Type.STRING, description: "official, derived, or not_detected" },
        confidence: { type: Type.STRING, description: "high, medium, or low" },
        evidence: { type: Type.STRING, description: "Explain where you saw the marks or how you derived them" }
      },
      required: ["source", "confidence"]
    },
    assessmentSummary: {
      type: Type.OBJECT,
      properties: {
        overallObservation: { type: Type.STRING },
        confidence: { type: Type.STRING, description: "high, medium, or low" },
      },
      required: ["overallObservation", "confidence"]
    },
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          questionNumber: { type: Type.STRING },
          matchedQuestionId: { type: Type.STRING },
          transcription: { type: Type.STRING },
          transcriptionConfidence: { type: Type.STRING },
          teacherMarksDetected: { type: Type.NUMBER },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          issues: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                description: { type: Type.STRING },
                confidence: { type: Type.STRING },
                evidence: { type: Type.STRING }
              },
              required: ["category", "description", "confidence"]
            }
          }
        },
        required: ["questionNumber"]
      }
    },
    strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
    primaryImprovementOpportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
    possibleMarkLossPatterns: { type: Type.ARRAY, items: { type: Type.STRING } },
    recommendedActions: { type: Type.ARRAY, items: { type: Type.STRING } }
  },
  required: [
    "subjectDetected",
    "assessmentSummary", 
    "questions", 
    "strengths", 
    "primaryImprovementOpportunities",
    "possibleMarkLossPatterns",
    "recommendedActions"
  ]
};

import { GoogleGenAI, Type, Schema } from '@google/genai';
import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';

// Initialize SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const GeminiLearningMRISchema: Schema = {
  type: Type.OBJECT,
  properties: {
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
    "assessmentSummary", 
    "questions", 
    "strengths", 
    "primaryImprovementOpportunities",
    "possibleMarkLossPatterns",
    "recommendedActions"
  ]
};

async function test() {
  console.log('Testing Gemini...');
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{
        text: `Analyze this math paper. It has questions 22, 23, 25, 26. Make up an analysis matching the schema.`
      }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: GeminiLearningMRISchema,
        temperature: 0.2
      }
    });

    console.log('Raw output:');
    console.log(response.text);
    
  } catch (err: any) {
    console.error('Error:', err);
  }
}

test();

import { z } from 'zod';
import { AssessmentSchema } from './assessment';

export const ConfidenceLevelSchema = z.enum(["high", "medium", "low"]);
export const QualitativeLevelSchema = z.enum(["Strong", "Developing", "Needs Attention"]);

export const ScoreSchema = z.object({
  obtained: z.number().nullable(),
  total: z.number().nullable(),
  source: z.enum(["official", "derived", "not_detected"]),
  confidence: ConfidenceLevelSchema,
  evidence: z.string().optional()
});

export const DiagnosticFindingSchema = z.object({
  category: z.string(),
  description: z.string(),
  confidence: ConfidenceLevelSchema,
  evidence: z.string().optional()
});

export const QuestionAnalysisSchema = z.object({
  questionNumber: z.string(),
  matchedQuestionId: z.string().optional(),
  transcription: z.string().optional(),
  transcriptionConfidence: ConfidenceLevelSchema.optional(),
  teacherMarksDetected: z.number().optional(),
  strengths: z.array(z.string()).optional(),
  issues: z.array(DiagnosticFindingSchema).optional()
});

export const LearningMRISchema = z.object({
  id: z.string(),
  studentId: z.string(),
  subjectDetected: z.string(),
  assessmentId: z.string().optional(),
  assessmentMetadata: AssessmentSchema.optional(),
  
  // Backward compatibility for old records
  officialScore: z.string().optional(),
  
  // New structured score
  score: ScoreSchema.optional(),
  
  createdAt: z.string(),
  
  assessmentSummary: z.object({
    overallObservation: z.string(),
    confidence: ConfidenceLevelSchema
  }),
  
  questions: z.array(QuestionAnalysisSchema),
  
  strengths: z.array(z.string()),
  primaryImprovementOpportunities: z.array(z.string()),
  possibleMarkLossPatterns: z.array(z.string()),
  recommendedActions: z.array(z.string()),
  historicalPatterns: z.array(z.string()).optional()
});

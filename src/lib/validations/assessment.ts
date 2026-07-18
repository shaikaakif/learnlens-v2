import { z } from 'zod';

export const AssessmentQuestionSchema = z.object({
  id: z.string(),
  questionNumber: z.string(),
  questionText: z.string(),
  maxMarks: z.number(),
  conceptTags: z.array(z.string()).optional(),
  commandWord: z.string().optional()
});

export const AssessmentSchema = z.object({
  id: z.string(),
  title: z.string(),
  subject: z.string(),
  grade: z.string(),
  date: z.string(),
  maxMarks: z.number(),
  questions: z.array(AssessmentQuestionSchema)
});

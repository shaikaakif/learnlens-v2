import { z } from 'zod';

export const StudentSchema = z.object({
  id: z.string(),
  full_name: z.string().min(1, "Name is required"),
  grade: z.string().min(1, "Grade is required"),
  school_name: z.string().optional(),
  board: z.string().optional(),
  subjects: z.array(z.string()).default([]),
  favorite_subject: z.string().optional(),
  learning_goals: z.string().optional(),
  areas_to_improve: z.string().optional(),
});

export const ProgressSnapshotSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  subject: z.string(),
  date: z.string(),
  metrics: z.object({
    conceptualUnderstanding: z.string(),
    writingMechanics: z.string(),
    application: z.string()
  }),
  recentTrends: z.array(z.string())
});

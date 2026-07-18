import { z } from 'zod';
import { AssessmentSchema, AssessmentQuestionSchema } from '@/lib/validations/assessment';
import { 
  LearningMRISchema, 
  QuestionAnalysisSchema, 
  DiagnosticFindingSchema,
  ConfidenceLevelSchema,
  QualitativeLevelSchema
} from '@/lib/validations/learning-mri';
import { StudentSchema, ProgressSnapshotSchema } from '@/lib/validations/student';

// Assessment Types
export type Assessment = z.infer<typeof AssessmentSchema>;
export type AssessmentQuestion = z.infer<typeof AssessmentQuestionSchema>;

// Learning MRI Types
export type LearningMRI = z.infer<typeof LearningMRISchema>;
export type QuestionAnalysis = z.infer<typeof QuestionAnalysisSchema>;
export type DiagnosticFinding = z.infer<typeof DiagnosticFindingSchema>;
export type ConfidenceLevel = z.infer<typeof ConfidenceLevelSchema>;
export type QualitativeLevel = z.infer<typeof QualitativeLevelSchema>;

// Student Types
export type Student = z.infer<typeof StudentSchema>;
export type ProgressSnapshot = z.infer<typeof ProgressSnapshotSchema>;

// Tutor Context Types
export interface TutorContext {
  studentFirstName: string;
  grade: string;
  subject: string;
  recentAssessment: string;
  strengths: string[];
  focusAreas: string[];
  contextString: string;
}

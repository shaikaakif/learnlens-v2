import { LearningMRI, Student } from '@/types';

export interface AnalysisRequest {
  assessmentId: string;
  studentId: string;
  files: File[];
  profileContext?: Student | null;
}

export interface AnalysisProvider {
  analyzeAssessment(request: AnalysisRequest): Promise<LearningMRI>;
}

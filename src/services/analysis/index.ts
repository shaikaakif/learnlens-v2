import { LearningMRI } from '@/types';

export class AnalysisService {
  async analyzeAssessment(files: File[]): Promise<string> {
    // REAL AI MODE via backend API route
    const formData = new FormData();
    // Hardcode a placeholder assessmentId temporarily to not break Gemini provider yet
    formData.append('assessmentId', 'generic');
    files.forEach(f => formData.append('files', f));

    const response = await fetch('/api/analyze', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      let errorMessage = `Analysis failed with status ${response.status}`;
      
      if (errorData?.error) {
        if (typeof errorData.error === 'string') {
          errorMessage = errorData.error;
        } else if (errorData.error.message) {
          errorMessage = errorData.error.message;
          if (errorData.error.details) {
            errorMessage += '\nDetails: ' + JSON.stringify(errorData.error.details);
          }
        }
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data.analysisId;
  }
}

export const analysisService = new AnalysisService();

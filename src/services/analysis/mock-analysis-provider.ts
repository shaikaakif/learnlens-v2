import { AnalysisProvider, AnalysisRequest } from './analysis-provider';
import { LearningMRI } from '@/types';
import { mockLearningMRI } from '@/data/mock/learning-mri';

export class MockAnalysisProvider implements AnalysisProvider {
  async analyzeAssessment(request: AnalysisRequest): Promise<LearningMRI> {
    // In Phase 1, we just return the mock MRI after a simulated delay.
    // The delay simulation itself should ideally be managed by the UI, but 
    // simulating network latency here ensures the UI handles async states correctly.
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In Phase 2, this will be replaced by the Gemini provider which will
    // parse the JSON and validate it against the Zod schema.
    return mockLearningMRI;
  }
}

import { AnalysisProvider, AnalysisRequest } from './analysis-provider';
import { LearningMRI } from '@/types';
import { GeminiAnalysisProvider } from './gemini-analysis-provider';
import { GeminiV2Provider } from './v2/gemini-v2-provider';
import { logAI } from '@/lib/ai/logger';

export class AnalysisPipelineRouter implements AnalysisProvider {
  private v1Provider: GeminiAnalysisProvider;
  private v2Provider: GeminiV2Provider;
  
  constructor() {
    this.v1Provider = new GeminiAnalysisProvider();
    this.v2Provider = new GeminiV2Provider();
  }

  async analyzeAssessment(request: AnalysisRequest): Promise<LearningMRI> {
    const version = process.env.ANALYSIS_PIPELINE_VERSION || 'v1';
    const reqId = `req-${Date.now()}`;
    
    logAI({ 
      requestId: reqId, 
      stage: 'PIPELINE_SELECTED', 
      message: `Selected pipeline version: ${version}` 
    });

    if (version === 'v2') {
      try {
        return await this.v2Provider.analyzeAssessment(request);
      } catch (error: any) {
        const fallback = process.env.ANALYSIS_V2_FALLBACK_TO_V1 === 'true';
        logAI({ 
          requestId: reqId, 
          stage: 'V2_FAILURE', 
          message: `V2 pipeline failed: ${error.message}. Fallback to V1: ${fallback}` 
        });

        if (fallback) {
          logAI({ requestId: reqId, stage: 'FALLBACK_TO_V1', message: 'Attempting V1 fallback' });
          return this.v1Provider.analyzeAssessment(request);
        } else {
          throw error;
        }
      }
    }

    // Default to V1
    return this.v1Provider.analyzeAssessment(request);
  }
}

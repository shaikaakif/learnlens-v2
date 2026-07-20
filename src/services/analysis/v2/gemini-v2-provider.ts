import { AnalysisProvider, AnalysisRequest } from '../analysis-provider';
import { LearningMRI } from '@/types';
import { GoogleGenAI } from '@google/genai';
import { SYSTEM_PROMPT_V2, buildAssessmentContextPromptV2, STRUCTURED_OUTPUT_INSTRUCTIONS_V2 } from '@/lib/ai/v2-prompts';
import { assessmentContextDb } from '@/data/mock/assessment-context';
import { LearningMRISchema } from '@/lib/validations/learning-mri';
import { GeminiLearningMRISchema } from '@/lib/ai/schema';
import { logAI } from '@/lib/ai/logger';
import { robustParseJson } from '@/lib/ai/parser';
import { normalizeLearningMRI } from '@/lib/ai/normalize';
import { AIFailureError } from '@/lib/ai/errors';

export class GeminiV2Provider implements AnalysisProvider {
  private primaryAi: GoogleGenAI;
  private secondaryAi?: GoogleGenAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is missing. Cannot initialize Gemini V2 Analysis Provider.');
    }
    this.primaryAi = new GoogleGenAI({ apiKey });
    
    const secondaryKey = process.env.GEMINI_API_KEY_SECONDARY;
    if (secondaryKey) {
      this.secondaryAi = new GoogleGenAI({ apiKey: secondaryKey });
    }
  }

  private async generateContentWithFallback(params: any): Promise<any> {
    try {
      return await this.primaryAi.models.generateContent(params);
    } catch (error: any) {
      if (this.secondaryAi) {
        console.warn('Primary Gemini API failed, falling back to secondary key. Error:', error.message);
        return await this.secondaryAi.models.generateContent(params);
      }
      throw error;
    }
  }

  async analyzeAssessment(request: AnalysisRequest): Promise<LearningMRI> {
    const reqId = `req-v2-${Date.now()}`;
    const timing: Record<string, number> = {};
    const globalStartTime = Date.now();
    
    logAI({ requestId: reqId, stage: 'REQUEST_RECEIVED', message: 'Starting V2 Optimized Pipeline' });

    let stageStart = Date.now();
    const context = (assessmentContextDb as any)[request.assessmentId] || null;
    const contextPrompt = buildAssessmentContextPromptV2(context, request.profileContext);
    const finalPrompt = `${SYSTEM_PROMPT_V2}\n\n${contextPrompt}\n\n${STRUCTURED_OUTPUT_INSTRUCTIONS_V2}`;
    timing['inputNormalizationMs'] = Date.now() - stageStart;
    
    logAI({ requestId: reqId, stage: 'INPUT_NORMALIZATION_COMPLETED' });

    try {
      stageStart = Date.now();
      const fileParts = await Promise.all(request.files.map(async (file) => {
        const buffer = await file.arrayBuffer();
        return {
          inlineData: {
            data: Buffer.from(buffer).toString('base64'),
            mimeType: file.type
          }
        };
      }));
      timing['imagePreprocessingMs'] = Date.now() - stageStart;
      logAI({ requestId: reqId, stage: 'FILES_VALIDATED', message: `Prepared ${fileParts.length} files (native multi-modal)` });

      const contents = [...fileParts, { text: finalPrompt }];

      stageStart = Date.now();
      logAI({ requestId: reqId, stage: 'HOLISTIC_ANALYSIS_STARTED', message: 'Calling gemini-flash-latest natively for document mapping and diagnosis' });

      // In V2, we leverage Gemini 1.5's massive context window for a single holistic pass 
      // rather than fragile batching. This perfectly builds the "Document Map" natively,
      // avoiding cross-page hallucination (like missing Q23).
      let response;
      try {
        response = await this.generateContentWithFallback({
          model: 'gemini-flash-latest',
          contents,
          config: {
            responseMimeType: 'application/json',
            responseSchema: GeminiLearningMRISchema,
            temperature: 0.1, // Lowered temperature for higher strictness on official scores
          }
        });
      } catch (err: any) {
        throw new AIFailureError('AI_PROVIDER_ERROR', 'Gemini API call failed', err.message);
      }
      
      timing['holisticAnalysisMs'] = Date.now() - stageStart;
      logAI({ requestId: reqId, stage: 'HOLISTIC_ANALYSIS_COMPLETED', message: `Duration: ${timing['holisticAnalysisMs']}ms` });

      stageStart = Date.now();
      logAI({ requestId: reqId, stage: 'VERIFICATION_STARTED', message: 'Parsing and enforcing Consistency Gate' });
      
      let rawJson = this.parseAndNormalize(response.text, reqId, request, context);
      let parseResult = LearningMRISchema.safeParse(rawJson);

      // Final Consistency Gate - Self-Repair if schema fails
      if (!parseResult.success) {
        logAI({ 
          requestId: reqId, 
          stage: 'SCHEMA_VALIDATION_FAILED', 
          message: 'Consistency Gate triggered repair',
          metadata: { issues: parseResult.error.issues } 
        });
        
        rawJson = await this.attemptRepair(rawJson, parseResult.error.issues, reqId, request, context);
        parseResult = LearningMRISchema.safeParse(rawJson);
        
        if (!parseResult.success) {
          logAI({ requestId: reqId, stage: 'ANALYSIS_FAILED', message: 'Repair attempt failed validation' });
          throw new AIFailureError('AI_SCHEMA_VALIDATION_FAILED', 'Could not structure AI response into a valid Learning MRI after repair.', parseResult.error.issues);
        }
      }
      
      timing['verificationMs'] = Date.now() - stageStart;
      logAI({ requestId: reqId, stage: 'VERIFICATION_COMPLETED', message: `Verification took ${timing['verificationMs']}ms` });
      logAI({ requestId: reqId, stage: 'SCHEMA_VALIDATION_SUCCESS' });

      timing['totalMs'] = Date.now() - globalStartTime;
      logAI({ 
        requestId: reqId, 
        stage: 'ANALYSIS_COMPLETED', 
        message: 'Returning valid LearningMRI from V2 pipeline',
        metadata: timing 
      });

      return parseResult.data;

    } catch (error: any) {
      logAI({ requestId: reqId, stage: 'ANALYSIS_FAILED', message: error.message });
      if (error instanceof AIFailureError) {
        throw error;
      }
      throw new AIFailureError('UNKNOWN_ANALYSIS_ERROR', error.message || 'An unexpected error occurred in Gemini V2 pipeline.');
    }
  }

  private parseAndNormalize(text: string | undefined, reqId: string, request: AnalysisRequest, context: any): any {
    if (!text) {
      throw new AIFailureError('AI_EMPTY_RESPONSE', 'Gemini returned empty text.');
    }
    
    logAI({ requestId: reqId, stage: 'JSON_PARSE_STARTED' });
    const parsed = robustParseJson(text);
    logAI({ requestId: reqId, stage: 'JSON_PARSE_SUCCESS' });
    
    const normalized = normalizeLearningMRI(parsed);
    
    normalized.id = `analysis-${Date.now()}`;
    normalized.studentId = request.studentId;
    normalized.assessmentId = request.assessmentId;
    
    if (context) {
      normalized.assessmentMetadata = {
        id: context.id,
        title: context.title,
        subject: context.subject,
        grade: context.grade,
        date: new Date().toISOString().split('T')[0],
        maxMarks: context.maxMarks || 100,
        questions: (context.questions || []).map((q: any) => ({
          id: `q-${q.questionNumber}`,
          questionNumber: String(q.questionNumber),
          questionText: q.text || "",
          maxMarks: q.marks || 0
        }))
      };
    } else {
      normalized.assessmentMetadata = undefined;
    }
    
    normalized.createdAt = new Date().toISOString();
    return normalized;
  }

  private async attemptRepair(failedJson: any, issues: any, reqId: string, request: AnalysisRequest, context: any): Promise<any> {
    logAI({ requestId: reqId, stage: 'REPAIR_ATTEMPT_STARTED' });
    const repairPrompt = `You are a strict JSON structure repair tool. 
Fix the JSON structure to match the required schema without changing semantic findings.
Errors:
${JSON.stringify(issues, null, 2)}

Invalid JSON:
${JSON.stringify(failedJson, null, 2)}`;

    const response = await this.generateContentWithFallback({
      model: 'gemini-flash-latest',
      contents: [{ text: repairPrompt }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: GeminiLearningMRISchema,
        temperature: 0,
      }
    });
    
    return this.parseAndNormalize(response.text, reqId, request, context);
  }
}

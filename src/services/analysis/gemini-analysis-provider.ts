import { AnalysisProvider, AnalysisRequest } from './analysis-provider';
import { LearningMRI } from '@/types';
import { GoogleGenAI } from '@google/genai';
import { SYSTEM_PROMPT, buildAssessmentContextPrompt, STRUCTURED_OUTPUT_INSTRUCTIONS } from '@/lib/ai/prompts';
import { assessmentContextDb } from '@/data/mock/assessment-context';
import { LearningMRISchema } from '@/lib/validations/learning-mri';
import { GeminiLearningMRISchema } from '@/lib/ai/schema';
import { logAI } from '@/lib/ai/logger';
import { robustParseJson } from '@/lib/ai/parser';
import { normalizeLearningMRI } from '@/lib/ai/normalize';
import { AIFailureError } from '@/lib/ai/errors';

export class GeminiAnalysisProvider implements AnalysisProvider {
  private ai: GoogleGenAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is missing. Cannot initialize Gemini Analysis Provider.');
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  async analyzeAssessment(request: AnalysisRequest): Promise<LearningMRI> {
    const reqId = `req-${Date.now()}`;
    
    logAI({ requestId: reqId, stage: 'REQUEST_RECEIVED', message: 'Starting Gemini analysis pipeline' });

    const context = (assessmentContextDb as any)[request.assessmentId] || null;
    
    logAI({ requestId: reqId, stage: 'ASSESSMENT_CONTEXT_READY', message: `Found context for ${request.assessmentId}` });

    const contextPrompt = buildAssessmentContextPrompt(context, request.profileContext);
    const finalPrompt = `${SYSTEM_PROMPT}\n\n${contextPrompt}\n\n${STRUCTURED_OUTPUT_INSTRUCTIONS}`;

    try {
      const fileParts = await Promise.all(request.files.map(async (file) => {
        const buffer = await file.arrayBuffer();
        return {
          inlineData: {
            data: Buffer.from(buffer).toString('base64'),
            mimeType: file.type
          }
        };
      }));

      logAI({ requestId: reqId, stage: 'FILES_VALIDATED', message: `Prepared ${fileParts.length} files` });

      const contents = [...fileParts, { text: finalPrompt }];

      const startTime = Date.now();
      logAI({ requestId: reqId, stage: 'GEMINI_REQUEST_STARTED', message: 'Calling gemini-2.5-flash with structured output' });

      let response;
      try {
        response = await this.ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents,
          config: {
            responseMimeType: 'application/json',
            responseSchema: GeminiLearningMRISchema,
            temperature: 0.2,
          }
        });
      } catch (err: any) {
        throw new AIFailureError('AI_PROVIDER_ERROR', 'Gemini API call failed', err.message);
      }
      
      logAI({ requestId: reqId, stage: 'GEMINI_RESPONSE_RECEIVED', message: `Duration: ${Date.now() - startTime}ms` });

      let rawJson = this.parseAndNormalize(response.text, reqId, request, context);
      let parseResult = LearningMRISchema.safeParse(rawJson);

      if (!parseResult.success) {
        logAI({ 
          requestId: reqId, 
          stage: 'SCHEMA_VALIDATION_FAILED', 
          message: 'Initial validation failed, attempting repair',
          metadata: { issues: parseResult.error.issues } 
        });
        
        // Single repair attempt
        rawJson = await this.attemptRepair(rawJson, parseResult.error.issues, reqId, request, context);
        parseResult = LearningMRISchema.safeParse(rawJson);
        
        if (!parseResult.success) {
          logAI({ requestId: reqId, stage: 'ANALYSIS_FAILED', message: 'Repair attempt failed validation' });
          throw new AIFailureError('AI_SCHEMA_VALIDATION_FAILED', 'Could not structure AI response into a valid Learning MRI after repair.', parseResult.error.issues);
        }
      }

      logAI({ requestId: reqId, stage: 'SCHEMA_VALIDATION_SUCCESS' });
      logAI({ requestId: reqId, stage: 'ANALYSIS_COMPLETED', message: 'Returning valid LearningMRI' });

      return parseResult.data;

    } catch (error: any) {
      logAI({ requestId: reqId, stage: 'ANALYSIS_FAILED', message: error.message });
      if (error instanceof AIFailureError) {
        throw error;
      }
      throw new AIFailureError('UNKNOWN_ANALYSIS_ERROR', error.message || 'An unexpected error occurred in Gemini pipeline.');
    }
  }

  private parseAndNormalize(text: string | undefined, reqId: string, request: AnalysisRequest, context: any): any {
    if (!text) {
      throw new AIFailureError('AI_EMPTY_RESPONSE', 'Gemini returned empty text.');
    }
    
    logAI({ requestId: reqId, stage: 'JSON_PARSE_STARTED' });
    const parsed = robustParseJson(text);
    logAI({ requestId: reqId, stage: 'JSON_PARSE_SUCCESS' });
    
    logAI({ requestId: reqId, stage: 'NORMALIZATION_STARTED' });
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
I have a JSON object that failed schema validation.
I need you to fix ONLY the structure to match the required schema. DO NOT change the actual semantic findings.
Here are the validation errors:
${JSON.stringify(issues, null, 2)}

Here is the invalid JSON:
${JSON.stringify(failedJson, null, 2)}

Return ONLY the corrected JSON object.`;

    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
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

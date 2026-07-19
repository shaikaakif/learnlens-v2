export type LogStage = 
  | 'REQUEST_RECEIVED'
  | 'FILES_VALIDATED'
  | 'ASSESSMENT_CONTEXT_READY'
  | 'GEMINI_REQUEST_STARTED'
  | 'GEMINI_RESPONSE_RECEIVED'
  | 'JSON_PARSE_STARTED'
  | 'JSON_PARSE_SUCCESS'
  | 'JSON_PARSE_FAILED'
  | 'NORMALIZATION_STARTED'
  | 'SCHEMA_VALIDATION_STARTED'
  | 'SCHEMA_VALIDATION_FAILED'
  | 'SCHEMA_VALIDATION_SUCCESS'
  | 'REPAIR_ATTEMPT_STARTED'
  | 'INPUT_NORMALIZATION_COMPLETED'
  | 'HOLISTIC_ANALYSIS_STARTED'
  | 'HOLISTIC_ANALYSIS_COMPLETED'
  | 'VERIFICATION_STARTED'
  | 'VERIFICATION_COMPLETED'
  | 'ANALYSIS_COMPLETED'
  | 'ANALYSIS_FAILED'
  | 'PIPELINE_SELECTED'
  | 'PREPROCESSING_STARTED'
  | 'PREPROCESSING_COMPLETED'
  | 'BLANK_DETECTION_COMPLETED'
  | 'BATCH_PLAN_CREATED'
  | 'BATCH_STARTED'
  | 'BATCH_COMPLETED'
  | 'AGGREGATION_STARTED'
  | 'AGGREGATION_COMPLETED'
  | 'FINAL_VALIDATION_SUCCESS'
  | 'DATABASE_INSERT_SUCCESS'
  | 'V2_FAILURE'
  | 'FALLBACK_TO_V1'
  | 'PDF_RECEIVED'
  | 'PDF_VALIDATED'
  | 'PDF_PREPARATION_STARTED'
  | 'PDF_PREPARATION_COMPLETED'
  | 'PDF_ANALYSIS_STARTED'
  | 'PDF_ANALYSIS_COMPLETED';

interface LogPayload {
  requestId: string;
  stage: LogStage;
  message?: string;
  metadata?: Record<string, any>;
}

export function logAI(payload: LogPayload) {
  const isDev = process.env.NODE_ENV !== 'production';
  
  // Format metadata safely (strip giant objects if necessary, though this is basic for now)
  const metaString = payload.metadata ? ` | Meta: ${JSON.stringify(payload.metadata)}` : '';
  
  const logString = `[LearnLens AI][${payload.stage}] Req: ${payload.requestId}${payload.message ? ` - ${payload.message}` : ''}${metaString}`;
  
  if (payload.stage.includes('FAILED') || payload.stage.includes('ERROR')) {
    console.error(logString);
  } else {
    console.log(logString);
  }
}

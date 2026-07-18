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
  | 'ANALYSIS_COMPLETED'
  | 'ANALYSIS_FAILED';

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

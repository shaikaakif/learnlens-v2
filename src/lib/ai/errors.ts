export type AICodeError = 
  | 'AI_EMPTY_RESPONSE'
  | 'AI_NON_JSON_RESPONSE'
  | 'AI_MALFORMED_JSON'
  | 'AI_SCHEMA_VALIDATION_FAILED'
  | 'AI_PROVIDER_ERROR'
  | 'AI_TIMEOUT'
  | 'AI_RATE_LIMITED'
  | 'AI_FILE_UNSUPPORTED'
  | 'UNKNOWN_ANALYSIS_ERROR';

export class AIFailureError extends Error {
  public code: AICodeError;
  public details?: any;

  constructor(code: AICodeError, message: string, details?: any) {
    super(message);
    this.name = 'AIFailureError';
    this.code = code;
    this.details = details;
  }
}

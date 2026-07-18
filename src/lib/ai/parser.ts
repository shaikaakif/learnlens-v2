import { AIFailureError } from './errors';

export function robustParseJson(rawText: string): any {
  if (!rawText || rawText.trim() === '') {
    throw new AIFailureError('AI_EMPTY_RESPONSE', 'The AI returned an empty response.');
  }

  const text = rawText.trim();
  
  // Fast path for clean JSON
  if (text.startsWith('{') && text.endsWith('}')) {
    try {
      return JSON.parse(text);
    } catch (e) {
      // Fall through to cleanup
    }
  }

  // Handle markdown fences
  const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (match && match[1]) {
    try {
      return JSON.parse(match[1]);
    } catch (e) {
      throw new AIFailureError('AI_MALFORMED_JSON', 'The AI returned markdown JSON but it was malformed.');
    }
  }

  // Attempt heuristic cleanup (find first { and last })
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const extracted = text.slice(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(extracted);
    } catch (e) {
      throw new AIFailureError('AI_MALFORMED_JSON', 'Extracted JSON was malformed.', { extracted });
    }
  }

  throw new AIFailureError('AI_NON_JSON_RESPONSE', 'Could not locate any valid JSON structure in the AI response.');
}

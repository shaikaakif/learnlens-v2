import { GoogleGenAI } from '@google/genai';
import { logAI } from '@/lib/ai/logger';

export interface ValidationResult {
  isAnswerSheet: boolean;
  confidence: 'high' | 'medium' | 'low';
  reason: string;
}

export class AnswerSheetValidator {
  private primaryAi: GoogleGenAI;
  private secondaryAi?: GoogleGenAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is missing. Cannot initialize AnswerSheetValidator.');
    }
    this.primaryAi = new GoogleGenAI({ apiKey });

    const secondaryKey = process.env.GEMINI_API_KEY_SECONDARY;
    if (secondaryKey) {
      this.secondaryAi = new GoogleGenAI({ apiKey: secondaryKey });
    }
  }

  private async generateWithFallback(params: any): Promise<any> {
    try {
      return await this.primaryAi.models.generateContent(params);
    } catch (error: any) {
      if (this.secondaryAi) {
        console.warn('Validator primary key failed, attempting secondary key:', error.message);
        return await this.secondaryAi.models.generateContent(params);
      }
      throw error;
    }
  }

  async validate(files: File[]): Promise<ValidationResult> {
    const reqId = `val-${Date.now()}`;
    logAI({ requestId: reqId, stage: 'VALIDATION_STARTED', message: `Validating ${files.length} file(s)` });

    try {
      // Convert max 3 pages for ultra-fast validation
      const sampleFiles = files.slice(0, 3);
      const fileParts = await Promise.all(
        sampleFiles.map(async (file) => {
          const buffer = await file.arrayBuffer();
          return {
            inlineData: {
              data: Buffer.from(buffer).toString('base64'),
              mimeType: file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'),
            },
          };
        })
      );

      const prompt = `You are an expert academic document classification gate for LearnLens AI.
Analyze the uploaded image(s)/document(s) holistically to determine if the content genuinely appears to be an academic answer sheet, test paper, examination page, school worksheet, or student assessment.

VALID CONTENTS (isAnswerSheet = true):
- Handwritten student answer sheets or solution sheets
- Printed exam papers containing student answers or handwriting
- Graded or teacher-checked answer sheets
- Unchecked/ungraded student answer sheets or blank school worksheets
- Multi-page assessments (even if a cover page or blank continuation page is present)
- Handwritten equations, diagrams, essay responses, or multiple-choice answers

INVALID CONTENTS (isAnswerSheet = false):
- Room, bed, furniture, landscape, or indoor photos
- Selfies, faces, or photos of people
- Random household objects, pets, or nature
- Completely blank or featureless images
- Unrelated website/app screenshots or social media memes
- Documents with no academic, educational, or examination context

FALSE REJECTION PREVENTION (IMPORTANT):
If you are uncertain or the document contains visible academic questions, handwritten text, question numbers (e.g. 1a, Q2), scores/marks, school logos, or exam layout—err on the side of caution and set isAnswerSheet: true with confidence: "medium" or "low".

Return STRICT JSON ONLY:
{
  "isAnswerSheet": boolean,
  "confidence": "high" | "medium" | "low",
  "reason": "concise 1-sentence explanation"
}`;

      const response = await this.generateWithFallback({
        model: 'gemini-flash-lite-latest',
        contents: [prompt, ...fileParts],
        config: {
          temperature: 0.1,
          maxOutputTokens: 200,
          responseMimeType: 'application/json',
        },
      });

      const responseText = response.text || '';
      logAI({ requestId: reqId, stage: 'VALIDATION_RESPONSE', message: responseText });

      const parsed = JSON.parse(responseText.trim());
      
      return {
        isAnswerSheet: typeof parsed.isAnswerSheet === 'boolean' ? parsed.isAnswerSheet : true,
        confidence: ['high', 'medium', 'low'].includes(parsed.confidence) ? parsed.confidence : 'medium',
        reason: parsed.reason || 'Content classified by validator',
      };
    } catch (err: any) {
      console.warn('AnswerSheetValidator error, defaulting to valid to prevent blocking user:', err.message);
      logAI({ requestId: reqId, stage: 'VALIDATION_ERROR', message: err.message });
      
      // Safety fail-open: Never block a valid student submission if the fast validator encounters a network error
      return {
        isAnswerSheet: true,
        confidence: 'low',
        reason: 'Validator bypassed due to connection state',
      };
    }
  }
}

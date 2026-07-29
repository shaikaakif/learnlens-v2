import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';

export const ExamQuestionSchema = z.object({
  questionNumber: z.string().default('Q1'),
  section: z.string().default('Section A'),
  questionText: z.string().default(''),
  maxMarks: z.number().min(0).default(1),
  conceptTopic: z.string().default('General Concept'),
  type: z.string().default('Descriptive')
});

export const ParsedExamPaperSchema = z.object({
  totalMarks: z.number().default(0),
  sections: z.array(z.string()).default([]),
  questions: z.array(ExamQuestionSchema).default([])
});

export type ExamQuestion = z.infer<typeof ExamQuestionSchema>;
export type ParsedExamPaper = z.infer<typeof ParsedExamPaperSchema>;

export interface ParsePaperInput {
  fileBuffer?: Buffer;
  base64Data?: string;
  mimeType: string;
  examTitle: string;
  subject: string;
  classLevel: string;
}

const ALLOWED_MIME_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB

export async function parseQuestionPaper(input: ParsePaperInput): Promise<ParsedExamPaper> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('[GeminiParserError] GEMINI_API_KEY environment variable is not set.');
    throw new Error('Server AI service is currently unavailable. Please contact administration.');
  }

  // Validate MIME Type
  const normalizedMime = (input.mimeType || '').toLowerCase();
  if (normalizedMime && !ALLOWED_MIME_TYPES.includes(normalizedMime)) {
    throw new Error('Please upload a PDF or image file (PNG/JPG) smaller than 15MB.');
  }

  // Validate File Data Size if available as base64 or buffer
  if (input.base64Data) {
    const estimatedSizeBytes = (input.base64Data.length * 3) / 4;
    if (estimatedSizeBytes > MAX_FILE_SIZE_BYTES) {
      throw new Error('File size exceeds the 15MB limit. Please upload a smaller question paper file.');
    }
  } else if (input.fileBuffer && input.fileBuffer.length > MAX_FILE_SIZE_BYTES) {
    throw new Error('File size exceeds the 15MB limit. Please upload a smaller question paper file.');
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // Supported Gemini Flash Models in order of preference
  const primaryModel = 'gemini-2.0-flash';
  const fallbackModel = 'gemini-1.5-flash';

  const promptText = `
You are an expert academic AI assistant parsing an official school examination paper for ${input.subject} (${input.classLevel}).
Exam Title: ${input.examTitle}

Your objective: Convert the provided examination paper into a clean, structured academic blueprint without hallucination.

Guidelines:
1. Detect and preserve all examination sections (e.g. "Section A", "Section B", "Part 1").
2. Extract exact question numbers (e.g. "Q1", "1(a)", "2.b", "Section A - Q3").
3. Preserve the exact wording of each question. Never fabricate missing questions.
4. Extract the assigned maximum marks for each question. If unstated, infer reasonably based on question complexity or set to 1.
5. Identify the core concept/topic tag for each question appropriate for ${input.subject}.
6. Classify question type into one of: "Multiple Choice", "Short Answer", "Long Answer", "Case Study", or "Diagram Based".
7. Extract all questions from MCQs, short answers, long answers, case studies, tables, or diagrams.

Strict JSON Output Schema Required (No markdown wrapper or extra commentary):
{
  "totalMarks": 50,
  "sections": ["Section A", "Section B"],
  "questions": [
    {
      "questionNumber": "1(a)",
      "section": "Section A",
      "questionText": "Exact text of the question...",
      "maxMarks": 2,
      "conceptTopic": "Identified Subject Topic",
      "type": "Multiple Choice | Short Answer | Long Answer"
    }
  ]
}
`;

  let contents: any[] = [promptText];

  if (input.base64Data) {
    contents.push({
      inlineData: {
        mimeType: normalizedMime || 'application/pdf',
        data: input.base64Data,
      },
    });
  } else if (input.fileBuffer) {
    contents.push({
      inlineData: {
        mimeType: normalizedMime || 'application/pdf',
        data: input.fileBuffer.toString('base64'),
      },
    });
  }

  // Attempt generation with primary model, falling back to secondary if needed
  let rawTextResponse = '';
  try {
    const response = await ai.models.generateContent({
      model: primaryModel,
      contents,
      config: {
        responseMimeType: 'application/json',
      },
    });
    rawTextResponse = response.text || '';
  } catch (primaryErr: any) {
    console.warn(`[GeminiParserWarn] Primary model ${primaryModel} failed. Attempting fallback ${fallbackModel}. Error:`, primaryErr?.message);
    try {
      const fallbackResponse = await ai.models.generateContent({
        model: fallbackModel,
        contents,
        config: {
          responseMimeType: 'application/json',
        },
      });
      rawTextResponse = fallbackResponse.text || '';
    } catch (fallbackErr: any) {
      console.error('[GeminiParserError] All Gemini models failed to process question paper:', fallbackErr);
      throw new Error('Question paper analysis failed. Our AI could not process this document. Please try again or edit manually.');
    }
  }

  try {
    let cleanedText = rawTextResponse.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```/, '').replace(/```$/, '').trim();
    }

    const parsedRaw = JSON.parse(cleanedText);
    const validatedData = ParsedExamPaperSchema.parse(parsedRaw);

    // Calculate total marks if not provided or 0
    if (!validatedData.totalMarks || validatedData.totalMarks === 0) {
      validatedData.totalMarks = validatedData.questions.reduce((sum, q) => sum + (q.maxMarks || 0), 0);
    }

    return validatedData;
  } catch (parseErr: any) {
    console.error('[GeminiParserError] Failed to parse or validate Gemini output JSON:', parseErr, 'Raw Output:', rawTextResponse);
    throw new Error('AI could not format the questions from this document. Please try re-parsing or add questions manually.');
  }
}

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

export async function parseQuestionPaper(input: ParsePaperInput): Promise<ParsedExamPaper> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Server configuration error: GEMINI_API_KEY is missing.');
  }

  const ai = new GoogleGenAI({ apiKey });
  const modelName = 'gemini-2.5-flash';

  const promptText = `
You are an expert educational AI parsing a teacher's Question Paper for ${input.subject} (${input.classLevel}).
Exam Title: ${input.examTitle}

Parse the provided question paper image/document and extract ALL questions and sections.

Strict JSON format required matching this structure:
{
  "totalMarks": 50,
  "sections": ["Section A", "Section B"],
  "questions": [
    {
      "questionNumber": "1(a)",
      "section": "Section A",
      "questionText": "Exact text of question 1a",
      "maxMarks": 2,
      "conceptTopic": "Identified Topic/Concept",
      "type": "Multiple Choice | Short Answer | Long Answer"
    }
  ]
}

Rules:
1. Extract exact question numbers (e.g. Q1, 1a, 2b).
2. Extract exact question text.
3. Extract maximum marks per question. If unstated, infer reasonably or set 1.
4. Infer conceptTopic based on subject context.
5. Return ONLY raw JSON without markdown decoration.
`;

  try {
    let contents: any[] = [promptText];

    if (input.base64Data) {
      contents.push({
        inlineData: {
          mimeType: input.mimeType,
          data: input.base64Data,
        },
      });
    } else if (input.fileBuffer) {
      contents.push({
        inlineData: {
          mimeType: input.mimeType,
          data: input.fileBuffer.toString('base64'),
        },
      });
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '';
    let cleanedText = responseText.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```/, '').replace(/```$/, '').trim();
    }

    const parsedRaw = JSON.parse(cleanedText);
    const validatedData = ParsedExamPaperSchema.parse(parsedRaw);

    // Calculate total marks if not provided
    if (!validatedData.totalMarks || validatedData.totalMarks === 0) {
      validatedData.totalMarks = validatedData.questions.reduce((sum, q) => sum + (q.maxMarks || 0), 0);
    }

    return validatedData;
  } catch (err: any) {
    console.error('Gemini Question Paper Parser Error:', err);
    throw new Error(`Question paper parsing failed: ${err.message || 'Malformed AI response'}`);
  }
}

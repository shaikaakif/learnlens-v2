import { logAI } from '@/lib/ai/logger';

export class PdfIngestion {
  /**
   * Processes a PDF file.
   * If Gemini natively supports PDFs, we may just validate and pass it through,
   * or we might split it if we need per-page blank detection.
   */
  static async ingest(file: File, reqId: string): Promise<File[]> {
    logAI({ requestId: reqId, stage: 'PDF_RECEIVED', message: `Processing PDF: ${file.name}` });
    
    // TODO: Implement PDF ingestion
    // For now, return the file itself wrapped in an array, assuming we might
    // feed the PDF directly to Gemini.
    return [file];
  }
}

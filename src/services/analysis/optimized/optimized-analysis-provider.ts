import { AnalysisProvider, AnalysisRequest } from '../analysis-provider';
import { LearningMRI } from '@/types';
import { logAI } from '@/lib/ai/logger';
import { PdfIngestion } from './pdf-ingestion';
import { ImagePreprocessor } from './image-preprocessor';
import { BlankPageDetector } from './blank-page-detector';
import { BatchPlanner } from './batch-planner';
import { BatchAnalyzer } from './batch-analyzer';
import { AnalysisAggregator } from './analysis-aggregator';

export class OptimizedAnalysisProvider implements AnalysisProvider {
  async analyzeAssessment(request: AnalysisRequest): Promise<LearningMRI> {
    const reqId = `req-${Date.now()}`;
    
    logAI({ 
      requestId: reqId, 
      stage: 'PREPROCESSING_STARTED', 
      message: `Starting V2 Optimized Analysis for ${request.files.length} files` 
    });

    let currentFiles = request.files;

    // 1. PDF Ingestion / Normalization (if any files are PDFs)
    const hasPdf = currentFiles.some(f => f.type === 'application/pdf');
    if (hasPdf) {
      logAI({ requestId: reqId, stage: 'PDF_RECEIVED', message: 'PDF detected, running PDF ingestion logic' });
      // TODO: Handle mixed uploads or single PDF properly.
      // Assuming for now if there is a PDF, we ingest the first one.
      const pdfFile = currentFiles.find(f => f.type === 'application/pdf');
      if (pdfFile) {
         currentFiles = await PdfIngestion.ingest(pdfFile, reqId);
      }
    }

    // 2. Preprocessing
    currentFiles = await ImagePreprocessor.process(currentFiles, reqId);

    // 3. Blank detection
    currentFiles = await BlankPageDetector.filter(currentFiles, reqId);

    // 4. Batch planning
    const plan = BatchPlanner.plan(currentFiles, reqId);

    // 5. Batch analysis
    const partials: Partial<LearningMRI>[] = [];
    let batchIndex = 0;
    for (const batch of plan.batches) {
      const partial = await BatchAnalyzer.analyze(batch, reqId, batchIndex, plan.batches.length);
      partials.push(partial);
      batchIndex++;
    }

    // 6. Aggregation
    const finalResult = await AnalysisAggregator.aggregate(partials, reqId);
    
    // Add context to final result
    finalResult.studentId = request.studentId;
    finalResult.assessmentId = request.assessmentId;
    // ...

    return finalResult;
  }
}

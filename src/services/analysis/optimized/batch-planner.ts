import { logAI } from '@/lib/ai/logger';

export interface BatchPlan {
  batches: File[][];
}

export class BatchPlanner {
  /**
   * Plans how to chunk the input files into multiple Gemini requests.
   */
  static plan(files: File[], reqId: string): BatchPlan {
    const batchSizeStr = process.env.AI_BATCH_SIZE || '6';
    const batchSize = parseInt(batchSizeStr, 10);
    
    const batches: File[][] = [];
    for (let i = 0; i < files.length; i += batchSize) {
      batches.push(files.slice(i, i + batchSize));
    }
    
    logAI({ requestId: reqId, stage: 'BATCH_PLAN_CREATED', message: `Created ${batches.length} batches of size up to ${batchSize}` });
    return { batches };
  }
}

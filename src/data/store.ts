import { LearningMRI } from '@/types';
import { mockLearningMRI } from './mock/learning-mri';

class InMemoryStore {
  private mris: Map<string, LearningMRI>;

  constructor() {
    this.mris = new Map();
    // Seed with mock data for direct visits
    this.mris.set(mockLearningMRI.id, mockLearningMRI);
  }

  saveMRI(mri: LearningMRI) {
    this.mris.set(mri.id, mri);
  }

  getMRI(id: string): LearningMRI | undefined {
    return this.mris.get(id);
  }
}

// Global singleton to survive hot reloads in dev (mostly)
export const globalStore = new InMemoryStore();

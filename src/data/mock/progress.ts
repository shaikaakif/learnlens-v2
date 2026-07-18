import { ProgressSnapshot } from '@/types';

export const mockProgressHistory: ProgressSnapshot[] = [
  {
    id: "prog-1",
    studentId: "student-1",
    subject: "English",
    date: "2026-06-01",
    metrics: {
      conceptualUnderstanding: "Strong",
      writingMechanics: "Needs Attention",
      application: "Developing"
    },
    recentTrends: [
      "Frequent capitalization errors.",
      "Good comprehension in poetry section."
    ]
  },
  {
    id: "prog-2",
    studentId: "student-1",
    subject: "English",
    date: "2026-07-15",
    metrics: {
      conceptualUnderstanding: "Strong",
      writingMechanics: "Developing",
      application: "Developing"
    },
    recentTrends: [
      "Capitalization improved, but still missing commas.",
      "Literature answers are conceptually correct but sometimes structurally incomplete."
    ]
  }
];

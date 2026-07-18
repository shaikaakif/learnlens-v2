import { LearningMRI } from '@/types';
import { mockAssessment } from './assessment';
import { LearningMRISchema } from '@/lib/validations/learning-mri';

const rawMockLearningMRI = {
  id: "analysis-1",
  studentId: "student-1",
  assessmentId: "assessment-eng-10-1",
  assessmentMetadata: mockAssessment,
  officialScore: "31/40",
  createdAt: new Date().toISOString(),
  
  assessmentSummary: {
    overallObservation: "Strong grasp of the core concepts and excellent reading comprehension, but frequent losses in marks due to writing mechanics (punctuation, capitalization) and occasionally incomplete answer structures in literature questions.",
    confidence: "high"
  },
  
  questions: [
    {
      questionNumber: "1",
      matchedQuestionId: "q1",
      teacherMarksDetected: 5,
      strengths: ["Accurate inference from text", "Clear understanding of the theme"],
      issues: []
    },
    {
      questionNumber: "2",
      matchedQuestionId: "q2",
      teacherMarksDetected: 7,
      strengths: ["Good vocabulary used", "Persuasive arguments presented"],
      issues: [
        {
          category: "formatting",
          description: "Incorrect format for formal letter (missing sender's address).",
          confidence: "high",
          evidence: "Started directly with 'To The Editor' without a sender address."
        },
        {
          category: "punctuation",
          description: "Missing commas after introductory phrases.",
          confidence: "medium"
        }
      ]
    },
    {
      questionNumber: "3",
      matchedQuestionId: "q3",
      teacherMarksDetected: 5,
      strengths: ["Perfect application of modal verbs"],
      issues: []
    },
    {
      questionNumber: "4",
      matchedQuestionId: "q4",
      teacherMarksDetected: 6,
      strengths: ["Identified key traits of the postmaster (empathetic, helpful)"],
      issues: [
        {
          category: "incomplete_answer",
          description: "Answer lacked a concluding sentence summarizing the character's impact.",
          confidence: "high",
          evidence: "Ended abruptly after listing traits."
        },
        {
          category: "spelling",
          description: "Misspelled 'empathetic' as 'empathtic'.",
          confidence: "high",
          evidence: "'empathtic'"
        }
      ]
    },
    {
      questionNumber: "5",
      matchedQuestionId: "q5",
      teacherMarksDetected: 8,
      strengths: ["Identified major subject-verb agreement errors"],
      issues: [
        {
          category: "capitalization",
          description: "Failed to capitalize proper nouns in the corrected text.",
          confidence: "high",
          evidence: "'new delhi' instead of 'New Delhi'"
        }
      ]
    }
  ],
  
  strengths: [
    "Reading comprehension and inference",
    "Understanding of literature themes",
    "Application of grammar rules (Modals)"
  ],
  primaryImprovementOpportunities: [
    "Writing mechanics: Punctuation and Capitalization",
    "Structuring long-form answers completely"
  ],
  possibleMarkLossPatterns: [
    "Losing marks on capitalization of proper nouns",
    "Forgetting to include concluding sentences in literature responses",
    "Minor spelling errors in complex words"
  ],
  recommendedActions: [
    "Review formal letter formatting guidelines",
    "Practice proofreading for capitalization and spelling before submitting",
    "Use the 'PEEL' (Point, Evidence, Explanation, Link) method for literature answers to ensure completeness"
  ],
  historicalPatterns: [
    "Punctuation errors were also noted in the previous assessment."
  ]
};

// Validate against Zod schema to ensure mock data is contract-compatible
export const mockLearningMRI: LearningMRI = LearningMRISchema.parse(rawMockLearningMRI);

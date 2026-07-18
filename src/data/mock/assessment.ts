import { Assessment } from '@/types';

export const mockAssessment: Assessment = {
  id: "assessment-eng-10-1",
  title: "English Periodic Test",
  subject: "English",
  grade: "Class 10",
  date: "2026-07-15",
  maxMarks: 40,
  questions: [
    {
      id: "q1",
      questionNumber: "1",
      questionText: "Read the passage and answer the following questions. (a) What was the main theme?",
      maxMarks: 5,
      conceptTags: ["Reading Comprehension", "Inference"]
    },
    {
      id: "q2",
      questionNumber: "2",
      questionText: "Write a formal letter to the editor about the city's traffic issues.",
      maxMarks: 10,
      conceptTags: ["Writing Skills", "Formal Letter", "Formatting"]
    },
    {
      id: "q3",
      questionNumber: "3",
      questionText: "Fill in the blanks with appropriate modals.",
      maxMarks: 5,
      conceptTags: ["Grammar", "Modals"]
    },
    {
      id: "q4",
      questionNumber: "4",
      questionText: "Describe the character of the postmaster in 'A Letter to God'.",
      maxMarks: 10,
      conceptTags: ["Literature", "Character Sketch", "Theme Analysis"]
    },
    {
      id: "q5",
      questionNumber: "5",
      questionText: "Identify and correct the errors in the given paragraph.",
      maxMarks: 10,
      conceptTags: ["Grammar", "Proofreading", "Syntax"]
    }
  ]
};

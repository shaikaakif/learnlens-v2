# AI Output Contract

Require structured output, not uncontrolled prose.

Example conceptual structure:

```json
{
  "assessment_summary": {
    "overall_observation": "",
    "confidence": "high"
  },
  "questions": [
    {
      "question_number": "3",
      "matched_question_id": "q3",
      "transcription": "",
      "transcription_confidence": "medium",
      "teacher_marks_detected": 2,
      "strengths": [],
      "issues": [
        {
          "category": "incomplete_answer",
          "description": "",
          "confidence": "high",
          "evidence": ""
        }
      ]
    }
  ],
  "learning_mri": {
    "strengths": [],
    "primary_improvement_opportunities": [],
    "possible_mark_loss_patterns": [],
    "recommended_actions": []
  }
}
```

Validate responses using Zod or equivalent.

Do not fabricate percentages. Prefer Strong / Developing / Needs Attention unless a deterministic metric formula exists.

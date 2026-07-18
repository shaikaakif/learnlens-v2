# AI Pipeline

## Inputs
Preferred:
- question paper,
- student answer sheet,
- subject,
- grade/class.

Optional:
- marking scheme/rubric,
- model answer,
- teacher-awarded marks,
- visible teacher corrections,
- historical learning profile.

## Pipeline
1. Parse question paper into question numbers, text, marks, command words, and concept tags.
2. Teacher verifies extracted structure.
3. Multimodal AI reads answer-sheet pages.
4. Identify question-number markers and segment responses.
5. Match each response to stored question.
6. Analyze response against question/rubric.
7. Separate knowledge issues from writing/execution issues.
8. Return structured JSON with confidence.
9. Validate JSON server-side.
10. Normalize findings into LearnLens categories.
11. Generate Learning MRI.
12. Compare with historical findings.

## Confidence
Use High / Medium / Low. Low-confidence handwriting or matching must be flagged rather than asserted.

## AI Rules
The model must:
- not invent unreadable handwriting,
- state uncertainty,
- use supplied assessment context,
- preserve teacher authority,
- avoid unsupported psychological conclusions,
- distinguish conceptual and mechanical errors.

## Model Independence
Implement an internal AI service abstraction so the provider can be replaced later.

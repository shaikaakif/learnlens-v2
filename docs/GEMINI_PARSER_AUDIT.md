# GEMINI QUESTION PAPER PARSER AUDIT & RELIABILITY PLAN

**Project**: LearnLens AI — Teacher Portal  
**Document**: `docs/GEMINI_PARSER_AUDIT.md`  
**Phase**: Phase 1 — Comprehensive Gemini Parser Audit  
**SDK**: `@google/genai` v2.12.0  

---

## 🔍 1. Current Architecture & Implementation Inspection

### 1.1 Architecture Flow
1. **Teacher Action**: Teacher initiates paper parsing from `/teacher/exams/[examId]`.
2. **Server Action**: `parseExamAction(examId)` in `src/app/actions/exams.ts` validates teacher authentication and retrieves question paper storage path or local base64 payload.
3. **AI Parsing Service**: `parseQuestionPaper(input)` in `src/services/ai/exam-paper-parser.ts` constructs the prompt and calls `@google/genai` SDK.
4. **Validation & Storage**: The AI output is cleaned, validated against `ParsedExamPaperSchema` using Zod, and persisted to `exams.parsed_paper_json`.

### 1.2 Current SDK & Configuration
- **Package**: `@google/genai` v2.12.0
- **Model Specified**: `gemini-2.5-flash` *(Deprecated / Invalid model identifier)*
- **API Key**: `process.env.GEMINI_API_KEY` (Server-side environment variable)
- **Input Format**: Base64 encoded file data (`inlineData`) or `fileBuffer` passed with `mimeType` (`application/pdf`, `image/png`, `image/jpeg`).

---

## ❌ 2. Current Failure Reason

### Error Message:
```
404 NOT_FOUND: This model models/gemini-2.5-flash is no longer available to new users. Please update your code to use a newer model.
```

### Root Cause:
`gemini-2.5-flash` is an invalid/deprecated model ID string in the Google GenAI API. Official supported Flash models in `@google/genai` are `gemini-2.0-flash` or `gemini-1.5-flash`.

---

## 🛠️ 3. Proposed Fix & Enhancements Plan

### 3.1 Model Replacement (Phase 2)
- Replace `gemini-2.5-flash` with official supported model `gemini-2.0-flash` (or fallback `gemini-1.5-flash` if `gemini-2.0-flash` encounters quota limits).
- Keep model selection strictly server-side inside `src/services/ai/exam-paper-parser.ts`.

### 3.2 Structured Output Contract Preservation (Phase 3)
- Maintain `ParsedExamPaperSchema` without changing property names:
  ```ts
  {
    totalMarks: number,
    sections: string[],
    questions: [
      {
        questionNumber: string,
        section: string,
        questionText: string,
        maxMarks: number,
        conceptTopic: string,
        type: string
      }
    ]
  }
  ```
- Guarantee 100% database compatibility with `public.exam_questions`.

### 3.3 Prompt Engineering Upgrade (Phase 4)
- Enhance system prompt with explicit instructions for:
  - Multi-section handling (Section A, Section B, etc.)
  - Diverse question types (MCQs, short answer, long answer, case studies, tables, diagrams)
  - Zero hallucination rules (extract exact text without inventing missing questions)
  - Accurate mark extraction and section classification

### 3.4 File Validation & Production Error Handling (Phases 5 & 6)
- Pre-validate file size (max 15MB) and MIME type (`application/pdf`, `image/png`, `image/jpeg`).
- Sanitize user-facing errors into clean, friendly messages while logging technical details server-side.

---

## 📑 Implementation Checklist
- [x] Phase 1: Audit (`docs/GEMINI_PARSER_AUDIT.md`)
- [ ] Phase 2: Model update to `gemini-2.0-flash`
- [ ] Phase 3: Contract preservation & Zod validation check
- [ ] Phase 4: AI Prompt Engineering upgrade
- [ ] Phase 5: File validation (PDF, PNG, JPG <15MB)
- [ ] Phase 6: Production error handling
- [ ] Phase 7: Verification (`npx tsc --noEmit` & `npm run build`)

# TEACHER_PORTAL_IMPLEMENTATION_PLAN.md — Master Technical Plan

## 1. Overview & Phased Roadmap
This document outlines the implementation strategy for the LearnLens AI Teacher Portal, structured across 11 incremental checkpoints from TP-V1.0 to TP-V1.10.

```text
TP-V1.0 Architecture & DB Foundation (CURRENT)
   ↓
TP-V1.1 Teacher Authentication
   ↓
TP-V1.2 Teacher Onboarding
   ↓
TP-V1.3 Dashboard + Profile
   ↓
TP-V1.4 Exam Creation + Persistence
   ↓
TP-V1.5 Gemini Question Paper Parser
   ↓
TP-V1.6 Review + Publish
   ↓
TP-V1.7 Student Exam Discovery
   ↓
TP-V1.8 Exam ↔ Analysis Integration
   ↓
TP-V1.9 Teacher Analytics
   ↓
TP-V1.10 Production Polish & Regression
```

---

## 2. Checkpoint Details & Subsystem Specifications

### TP-V1.0 — Architecture & Data Foundation (Current Mission)
- **Goal**: Establish canonical route mapping, audit repository, design RLS data model, and generate additive SQL migration file.
- **Deliverables**: `supabase/migrations/20260729_tp_v1_0_foundation.sql`, `ARCHITECTURE_REPORT.md`, `DATABASE_REPORT.md`, `TEACHER_PORTAL_IMPLEMENTATION_PLAN.md`.

### TP-V1.1 — Teacher Authentication
- **Goal**: Implement server-side teacher login/signup with email confirmation flow using existing Supabase Auth.

### TP-V1.2 — Teacher Onboarding
- **Goal**: Implement multi-step wizard (`Name` -> `School` -> `Subject` -> `Classes` -> `Confirmation`) saving to `teacher_profiles` and `teacher_classes`.

### TP-V1.3 — Dashboard + Profile
- **Goal**: Server-rendered teacher dashboard displaying real exam counts, class list, and profile editor.

### TP-V1.4 — Exam Creation + Persistence
- **Goal**: Progressive step-by-step exam metadata input and paper upload to private Supabase storage.

### TP-V1.5 — Gemini Question Paper Parser
- **Goal**: Secure server-side route `/api/exams/parse` calling Gemini API to extract structured JSON question paper blueprints.

### TP-V1.6 — Human Review + Publish
- **Goal**: Teacher review screen allowing manual edit of questions, marks, and topics before updating status to `PUBLISHED`.

### TP-V1.7 — Student Exam Discovery
- **Goal**: Minimal student dashboard integration displaying published exams matching student grade level.

### TP-V1.8 — Exam ↔ Analysis Integration
- **Goal**: Pass optional `exam_id` into Gemini analysis pipeline without modifying existing student analysis workflow.

### TP-V1.9 — Teacher Analytics
- **Goal**: Real-time aggregation of student scores, common mark-loss areas, and conceptual gaps for teacher insights.

### TP-V1.10 — Production Polish & Regression Verification
- **Goal**: Full UI alignment with LearnLens design system, zero dark-mode regression, complete automated build and lint validation.

---

## 3. Risk Mitigation & Verification Rules
- All mutations must be additive.
- `npx tsc --noEmit` and `npm run build` must pass after every checkpoint.
- Existing student features remain 100% untouched.

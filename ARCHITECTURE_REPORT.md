# ARCHITECTURE_REPORT.md — Teacher Portal V1.0 Architecture Audit

## 1. Executive Summary
This report defines the structural route architecture, middleware/proxy rules, server/client boundaries, and protection mechanisms for extending LearnLens AI with the Teacher Portal.

---

## 2. Route Map & Route Ownership

### Canonical Directory Structure
All teacher portal pages resolve under the `/teacher` path segment. To ensure single route ownership and zero collision with route groups:
- Canonical Route Group: `src/app/(portals)/teacher/`
- Prohibited Path: `src/app/teacher/` (Do NOT create files directly under `src/app/teacher` to avoid Next.js route collision with `(portals)`).

| Public URL Path | Canonical File Path | Access Level | Purpose |
| :--- | :--- | :--- | :--- |
| `/teacher/login` | `src/app/(portals)/teacher/login/page.tsx` | Public | Teacher Sign In / Sign Up |
| `/teacher/onboarding` | `src/app/(portals)/teacher/onboarding/page.tsx` | Auth + Profile Missing | Multi-step Teacher Setup |
| `/teacher/dashboard` | `src/app/(portals)/teacher/dashboard/page.tsx` | Authenticated Teacher | Class & Exam Management Overview |
| `/teacher/profile` | `src/app/(portals)/teacher/profile/page.tsx` | Authenticated Teacher | Profile & Class Configuration |
| `/teacher/exams/create` | `src/app/(portals)/teacher/exams/create/page.tsx` | Authenticated Teacher | Progressive Exam & Paper Creator |
| `/teacher/exams/[examId]` | `src/app/(portals)/teacher/exams/[examId]/page.tsx` | Authenticated Teacher | Exam Details & Blueprint Review |
| `/teacher/exams/[examId]/analytics` | `src/app/(portals)/teacher/exams/[examId]/analytics/page.tsx` | Authenticated Teacher | Learning MRI Class Insights |

---

## 3. Protected System Boundaries

The following existing directories and modules are **PROTECTED** and must NOT be altered or regressed:

1. **Student Core Engine**: `src/app/student/`, `src/app/api/analyze/`
2. **Analysis Pipelines**: `src/services/ai/gemini-v1.ts`, `src/services/ai/gemini-v2.ts`, `src/services/ocr/`
3. **Learning MRI Generator**: `src/services/learning-mri/`
4. **Supabase Core SSR Client**: `src/lib/supabase/server.ts`, `src/lib/supabase/client.ts`
5. **Global Design Tokens**: `src/app/globals.css`, `src/components/ui/ambient-aurora-background.tsx`

---

## 4. Middleware & Auth Proxy Verification
- Location: `src/proxy.ts` -> delegates to `src/lib/supabase/middleware.ts`
- Behavior: Utilizes `@supabase/ssr` to refresh user tokens and enforce authenticated session cookies.
- Extension Point: In TP-V1.1, `middleware.ts` will enforce that `/teacher/*` routes require an active session and redirect unauthorized requests to `/teacher/login`.

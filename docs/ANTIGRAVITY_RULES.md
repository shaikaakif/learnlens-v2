# LearnLens AI — Teacher Portal Production Implementation Protocol

## Status

PROJECT: LearnLens AI
TARGET: Production Teacher Portal
FRAMEWORK: Next.js 16 / App Router / TypeScript
DATABASE + AUTH: Supabase
AI: Gemini
PRODUCT STATE: Existing student application is stable and must remain stable.

This document is the engineering constitution for the next development phase.

The objective is to implement the Teacher Portal completely without destabilizing the existing LearnLens application.

---

# 0. PRIMARY DIRECTIVE

We are NOT rebuilding LearnLens.

We are extending the existing stable product.

The existing application already contains working systems including:

- Student authentication
- Student dashboard
- Answer-sheet upload
- Camera/crop workflow
- Gemini analysis
- Gemini V1/V2 pipelines
- OCR
- Learning MRI
- Progress
- Profile
- PWA functionality
- Existing Supabase integration
- Existing routing
- Existing design system

These systems are PROTECTED.

Do not refactor, rewrite, reorganize, rename, move, or "improve" protected systems unless the Teacher Portal absolutely requires an integration point.

When an integration point is necessary, make the smallest possible change.

---

# 1. FIRST ACTION — CREATE A SAFETY CHECKPOINT

Before changing ANY code:

Run:

```bash
git status
git branch --show-current
git log --oneline -10
```

Confirm the current stable state.

If there are uncommitted changes, inspect them before proceeding.

Create a dedicated development branch:

```bash
git checkout -b teacher-portal-v1
```

Do NOT develop directly on the stable competition branch or main production branch.

Do NOT rewrite Git history.

Do NOT run destructive Git commands.

Forbidden unless explicitly authorized:

```bash
git reset --hard
git clean -fd
git push --force
git rebase
```

---

# 2. INSPECT BEFORE IMPLEMENTING

DO NOT begin coding immediately.

First perform a repository audit.

Understand:

- src/app routing structure
- route groups
- student routes
- teacher routes already present
- admin routes
- middleware/proxy
- Supabase client architecture
- authentication actions
- database types
- existing migrations
- existing design components
- analytics architecture
- analysis pipeline
- Learning MRI persistence
- existing profile schema

Specifically inspect for route collisions.

Next.js route groups such as:

```text
(portals)
(authenticated)
(marketing)
```

do NOT become URL segments.

Therefore verify that two pages do not resolve to the same public URL.

Example of forbidden architecture:

```text
src/app/teacher/page.tsx
src/app/(portals)/teacher/page.tsx
```

Both resolve to:

```text
/teacher
```

Never create duplicate route ownership.

---

# 3. USE SUB-AGENTS FOR AUDIT WORK

Use specialized sub-agents where available.

Sub-agents should investigate and REPORT.

They should not independently rewrite large areas of the repository.

## Agent A — Architecture Auditor

Inspect:

- routes
- layouts
- middleware
- server/client boundaries
- existing teacher code
- authentication architecture

Output:

```text
ARCHITECTURE_REPORT.md
```

Include route ownership and potential collisions.

---

## Agent B — Supabase Auditor

Inspect:

- tables
- migrations
- RLS
- foreign keys
- profile structure
- analyses
- storage
- auth integration

Output:

```text
DATABASE_REPORT.md
```

Do NOT modify the database.

---

## Agent C — Design System Auditor

Inspect the EXISTING polished LearnLens UI.

Extract:

- colors
- typography
- spacing
- border radii
- cards
- buttons
- inputs
- Aurora implementation
- responsive behavior
- loading states
- empty states

Output:

```text
DESIGN_SYSTEM_REPORT.md
```

The Teacher Portal must inherit this system.

Do NOT invent a separate Teacher Portal design language.

---

## Agent D — Teacher Portal Auditor

Inspect all currently existing teacher code.

Classify every component as:

KEEP
MODIFY
REMOVE
REPLACE

Identify:

- mock data
- dummy analytics
- incomplete forms
- broken persistence
- missing navigation
- authentication problems
- browser-native controls
- duplicated components

Output:

```text
TEACHER_PORTAL_AUDIT.md
```

---

## Agent E — Regression Auditor

Map protected systems and determine files that should NOT be touched.

Output:

```text
PROTECTED_FILES_REPORT.md
```

This becomes the regression boundary.

---

# 4. STOP AFTER AUDIT AND CREATE IMPLEMENTATION MAP

After sub-agent investigation, synthesize findings.

Do NOT blindly implement previous plans.

The repository itself is the source of truth.

Produce:

```text
TEACHER_PORTAL_IMPLEMENTATION_PLAN.md
```

The implementation plan must identify:

1. Existing architecture
2. Files that can be reused
3. Files requiring modification
4. New files required
5. Database changes
6. RLS changes
7. Storage requirements
8. API routes
9. Server Actions
10. Client components
11. Protected files
12. Testing strategy

Then implement according to this map.

---

# 5. TEACHER PORTAL PRODUCT REQUIREMENTS

The final Teacher Portal requires these systems:

```text
Authentication
      ↓
Teacher Identity
      ↓
Onboarding
      ↓
Teacher Dashboard
      ↓
Create Examination
      ↓
Question Paper Parsing
      ↓
Human Review
      ↓
Publish Examination
      ↓
Student Discovery
      ↓
Student Analysis
      ↓
Exam-linked Learning MRI
      ↓
Teacher Analytics
```

Every stage must persist correctly.

---

# 6. AUTHENTICATION ARCHITECTURE

Use the EXISTING Supabase Auth system.

DO NOT create a second authentication system.

Students and teachers may share Supabase Auth identities.

Authorization must be database-backed.

Never authorize teachers based solely on:

- client state
- localStorage
- cookies containing arbitrary roles
- hardcoded passwords
- UI visibility

Teacher access must be verified server-side.

Expected model:

```text
auth.users
     │
     ├── student profile
     │
     └── teacher_profiles
```

A teacher portal route must verify that the authenticated user has the appropriate teacher identity/profile.

Unauthorized users must not access teacher data merely by entering a URL manually.

---

# 7. TEACHER ONBOARDING

First-time teacher experience:

```text
Teacher authentication
        ↓
Profile lookup
        ↓
Profile missing
        ↓
Onboarding
```

Use one-decision-per-screen UX.

Steps:

1. Teacher Name
2. School
3. Subject
4. Classes taught
5. Confirmation
6. Dashboard

Classes:

6–12

Allow multiple classes.

Use existing LearnLens components.

Provide:

Back
Continue

where appropriate.

Persist the onboarding result to Supabase.

Refreshing the browser must NOT lose completed onboarding.

---

# 8. TEACHER PROFILE

Implement:

```text
/teacher/profile
```

Teacher should be able to view and edit:

- name
- school
- primary subject
- classes taught
- profile/avatar where supported

Provide:

- Save changes
- Logout

All modifications must persist to Supabase.

Do not create fake profile information.

---

# 9. TEACHER DASHBOARD

Dashboard data must come entirely from Supabase.

Header:

```text
Good morning, [Teacher Name]
```

or equivalent contextual greeting.

Core areas:

```text
Create Examination

Recent Examinations

Active Examinations

Basic Class Insights
```

When the teacher has zero examinations:

DO NOT display fake exams.

Display:

```text
No examinations yet.

Create your first examination to start receiving
learning insights from your students.
```

Primary CTA:

```text
Create Examination
```

The empty state must look intentional and complete.

---

# 10. CREATE EXAMINATION

Teacher workflow:

```text
Create Examination
      ↓
Exam Name
      ↓
Class
      ↓
Section (optional where appropriate)
      ↓
Question Paper
      ↓
Blueprint (optional)
      ↓
AI Parsing
      ↓
Human Review
      ↓
Publish
```

Do not use one giant form.

Use guided progressive steps.

Provide Back navigation.

Never lose already entered information when moving between steps.

---

# 11. QUESTION PAPER UPLOAD

Support appropriate existing formats, prioritizing:

- PDF
- JPG
- JPEG
- PNG

Use a LearnLens upload surface.

Do NOT expose a raw browser file input as the visible interface.

The native input may exist underneath for accessibility/functionality.

Display:

- filename
- file type
- upload state
- parsing state
- error state

---

# 12. GEMINI QUESTION PAPER PARSER

This system is separate from the answer-sheet analysis pipeline.

DO NOT modify Gemini V1/V2 analysis providers.

Architecture:

```text
Browser
   ↓
Secure Next.js Server Endpoint
   ↓
Authentication + authorization
   ↓
File validation
   ↓
Gemini Question Paper Parser
   ↓
Structured response
   ↓
Schema validation
   ↓
Teacher Review
```

GEMINI_API_KEY must remain server-side.

NEVER use:

```text
NEXT_PUBLIC_GEMINI_API_KEY
```

for privileged Gemini operations.

Never expose API keys to the browser.

---

# 13. STRUCTURED QUESTION PAPER MODEL

Parse useful information such as:

```text
Exam
 ├── Sections
 │    ├── Questions
 │    │    ├── question number
 │    │    ├── question text
 │    │    ├── marks
 │    │    ├── topic/concept where confidently inferable
 │    │    └── type where confidently inferable
```

Do not fabricate information that cannot be inferred.

Unknown information should remain null/unknown.

---

# 14. HUMAN-IN-THE-LOOP RULE

Gemini must NOT directly publish examination data.

Flow:

```text
Gemini Output
      ↓
Schema Validation
      ↓
Teacher Review
      ↓
Teacher Correction
      ↓
Teacher Approval
      ↓
Database
```

Teacher must be able to correct:

- question number
- marks
- text
- section
- topic where relevant

before publishing.

---

# 15. EXAMINATION PERSISTENCE

Publishing an examination must create real database records.

Expected relationships should conceptually support:

```text
Teacher
   ↓
Exam
   ↓
Question Paper / Structured Blueprint
   ↓
Student Attempts
   ↓
Analyses
```

Do not fake persistence using React state.

After publishing:

1. Database insert succeeds.
2. Teacher is redirected appropriately.
3. Dashboard queries Supabase.
4. Newly created exam appears.

Refresh the browser.

Exam must still exist.

---

# 16. EXAM STATES

Use clear states such as:

```text
DRAFT
PUBLISHED
ARCHIVED
```

Do not create arbitrary inconsistent status strings.

Teacher should be able to:

- view
- publish
- archive/deactivate where supported
- delete only when safe and explicitly confirmed

Destructive actions require confirmation.

---

# 17. STUDENT EXAM DISCOVERY

Do not redesign the entire student dashboard.

Add the smallest integration necessary.

Student profile contains class/grade.

Published exams are matched against that class.

Example:

```text
Periodic Test 1

Mathematics

Created by [Teacher Name]

Analyze Answer Sheet
```

Only real published exams should appear.

If none exist, preserve the existing student dashboard without unnecessary empty UI.

---

# 18. EXAM-LINKED ANALYSIS

When analysis starts from a teacher-created exam:

pass an `exam_id` or equivalent relationship through the analysis request.

CRITICAL:

This must be ADDITIVE.

Existing generic analysis must continue working exactly as before.

Conceptually:

```text
Existing analysis:

Answer Sheet
    ↓
Gemini
    ↓
Learning MRI

Teacher exam analysis:

Answer Sheet + optional exam_id
    ↓
Existing Gemini pipeline
    ↓
Learning MRI
    ↓
Link result to exam
```

Do NOT fork the analysis engine.

Do NOT duplicate Gemini V1/V2.

Do NOT alter scoring behavior merely because an exam is linked unless explicitly designed and validated later.

---

# 19. TEACHER ANALYTICS

Analytics must derive from real analyses.

Possible metrics:

- students analyzed
- average score where score data exists
- commonly lost marks
- recurring misconceptions
- strongest concepts
- weakest concepts
- question-level performance where mapping is reliable

Never fabricate AI insights.

If there is insufficient data:

```text
Insights will appear after students analyze this examination.
```

If only three students submitted:

show three.

Never simulate thirty.

---

# 20. MARK-LOSS EVIDENCE

Existing Learning MRI mark-loss evidence is valuable.

Do not remove or weaken it.

Where the existing schema provides evidence for:

- lost marks
- question
- mistake
- explanation
- improvement

Teacher analytics may aggregate this information carefully.

But raw student-level private information must only be exposed according to intended authorization.

---

# 21. DATABASE RULES

Supabase is the source of truth.

Do not create production state using:

- localStorage
- hardcoded arrays
- MOCK_EXAMS
- dummy JSON
- fake analytics
- sample teachers

Static configuration is allowed for legitimate fixed values such as:

```text
Class 6
Class 7
...
Class 12
```

and supported subject options.

That is configuration, not mock data.

---

# 22. DATABASE MIGRATIONS

Do NOT manually mutate existing production tables unpredictably.

Create migration files.

Migration must be:

- additive wherever possible
- backwards compatible
- idempotent where appropriate
- indexed appropriately
- protected with RLS

Before generating SQL:

inspect existing schema.

Do not assume table/column names.

If SQL must be manually executed in Supabase:

generate one clearly labeled migration and provide exact instructions.

Do not pretend the migration has been applied.

---

# 23. ROW LEVEL SECURITY

Every teacher-facing table must have explicit RLS reasoning.

Teacher should only access data they are authorized to access.

Examples:

Teacher profile:

```text
teacher.user_id = auth.uid()
```

Teacher exam:

```text
exam.teacher_id belongs to authenticated teacher
```

Exam analytics:

authenticated teacher must own/have authorization for the examination.

Never depend only on frontend filtering for authorization.

---

# 24. STORAGE SECURITY

Question papers and blueprints must not automatically become publicly accessible.

Use appropriate Supabase Storage policies.

Prefer private storage where documents contain school assessment material.

Use authenticated/signed access where necessary.

Validate:

- MIME type
- size
- ownership
- upload path

Do not trust filenames supplied by users.

---

# 25. DESIGN SYSTEM — NON-NEGOTIABLE

DO NOT create a grey generic SaaS dashboard.

DO NOT create a cyberpunk dashboard.

DO NOT create a new Teacher theme.

Teacher Portal is LearnLens.

Use existing LearnLens visual DNA:

- premium warm white
- LearnLens green
- Living Pistachio
- restrained Aurora accents
- subtle rose/pink/lavender accents already compatible with the brand
- premium cards
- soft shadows
- generous whitespace
- clean typography
- subtle glass surfaces where already used

Avoid arbitrary Tailwind colors when design tokens already exist.

Example:

Prefer:

```text
text-primary
bg-background
border-border
```

over randomly introducing:

```text
emerald-600
gray-800
slate-700
```

unless those values are genuinely part of the existing system.

---

# 26. UI REUSE RULE

Before creating:

Button
Card
Input
Select
Modal
Dialog
Badge
Dropdown
Upload surface
Empty state
Loading indicator

search the repository.

Reuse existing components whenever feasible.

Do not create:

```text
TeacherButton
TeacherCard
TeacherInput
```

when LearnLens already has equivalent shared components.

---

# 27. RESPONSIVE DESIGN

Every Teacher Portal page must be designed for:

Mobile
Tablet
Laptop
Desktop

No horizontal overflow.

No clipped bottom navigation.

No controls hidden below viewport.

No giant desktop cards compressed onto mobile.

No ugly native scrollbar appearing unnecessarily.

Use:

```text
100dvh
safe-area-inset
responsive breakpoints
```

where appropriate.

Touch targets should remain comfortably usable.

---

# 28. ACCESSIBILITY

Maintain:

- semantic labels
- keyboard navigation
- visible focus states
- adequate contrast
- button semantics
- accessible file upload
- reduced motion support

Do not sacrifice accessibility for visual polish.

---

# 29. HAPTICS

Use existing LearnLens haptic utilities where appropriate on supported mobile devices.

Suitable:

- Continue
- Successful save
- Exam published
- Selection confirmation

Do NOT vibrate constantly.

Haptics should reinforce meaningful interaction.

---

# 30. MOTION

Motion should be subtle.

Allowed:

- gentle fade
- slight scale
- Aurora breathing
- card entrance
- checkmark completion
- step transition

Avoid:

- excessive bouncing
- glitch effects
- constant movement
- distracting rainbow animation

This is education software, not a gaming interface.

---

# 31. ERROR HANDLING

Every network operation requires:

```text
Idle
Loading
Success
Error
```

Never leave a button apparently frozen.

Example:

```text
Parsing question paper...
```

Failure:

```text
We couldn't read this question paper.

Try another file or try again.
```

Do not expose raw Gemini/Supabase errors directly to teachers.

Log technical details server-side where appropriate.

---

# 32. NO SILENT FAILURE

Never write:

```typescript
try {
  ...
} catch {
}
```

for important operations.

Failures must be handled intentionally.

Database insert failure must not show success.

Gemini parser failure must not publish an empty exam.

---

# 33. SERVER / CLIENT BOUNDARIES

Prefer Server Components for data-heavy pages.

Use Client Components only where browser interaction requires them.

Examples:

Server:

- dashboard queries
- analytics queries
- authorization
- profile fetching

Client:

- onboarding interaction
- file picker
- progressive exam creator
- interactive review

Never move server secrets into Client Components merely for convenience.

---

# 34. NO DIRECT DATABASE TRUST FROM CLIENT

Sensitive operations should use appropriate Server Actions/API routes with server-side authorization.

Never assume:

"the button is only visible to teachers, therefore this operation is secure."

UI visibility is not authorization.

---

# 35. PERFORMANCE

Avoid unnecessary:

- polling
- duplicate Supabase queries
- client fetching after server rendering
- large animation libraries
- giant JS bundles
- repeated Gemini requests

Question paper parsing should happen only when needed.

Do not call Gemini on every render.

---

# 36. NO FEATURE CREEP

Do NOT implement during this phase:

- Parent Portal
- Principal Portal
- ERP integration
- attendance
- fees
- chat system
- notifications platform
- school-wide management suite
- unrelated AI Tutor changes

Teacher Portal first.

Complete it properly.

---

# 37. IMPLEMENTATION STRATEGY — VERTICAL SLICES

Do NOT build twenty files and test at the end.

Implement one vertical slice at a time.

## Slice 1

Teacher Auth + Authorization

Verify.

Commit.

## Slice 2

Teacher Onboarding + Persistence

Verify.

Commit.

## Slice 3

Teacher Dashboard + Profile

Verify.

Commit.

## Slice 4

Exam Creation + Database

Verify.

Commit.

## Slice 5

Secure Gemini Question Parser

Verify.

Commit.

## Slice 6

Review + Publish

Verify.

Commit.

## Slice 7

Student Exam Discovery

Verify existing student functionality.

Commit.

## Slice 8

Exam-linked Analysis

Regression-test Gemini V1/V2.

Commit.

## Slice 9

Teacher Analytics

Verify real data only.

Commit.

## Slice 10

Responsive + UX + Accessibility Polish

Final verification.

Commit.

---

# 38. VERIFICATION AFTER EVERY SLICE

Run:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

Do not claim success unless the command actually ran successfully.

Also manually verify the feature being implemented.

A successful build does NOT prove the product works.

---

# 39. REGRESSION TESTS

After integration changes, verify existing flows:

Student login

↓

Dashboard

↓

Add Answer Sheet

↓

Camera / Upload

↓

Crop

↓

Analyze

↓

Gemini V1/V2 routing

↓

Learning MRI

↓

Progress

Nothing in Teacher Portal development may break this chain.

---

# 40. NEVER FAKE VERIFICATION

Forbidden:

"Build passed"

unless build was executed.

Forbidden:

"Supabase persistence works"

unless persistence was tested.

Forbidden:

"RLS secured"

unless policies were inspected/tested.

Forbidden:

"Gemini works"

unless the server request was tested.

Report UNKNOWN when unknown.

That is better engineering than inventing confidence.

---

# 41. CHECKPOINT POLICY

After a verified vertical slice:

```bash
git status
git diff
```

Review scope.

Then create a focused commit.

Example:

```bash
git add .
git commit -m "feat(teacher): implement onboarding persistence"
```

Do not create giant commits containing unrelated changes.

Do NOT automatically push unless explicitly authorized.

---

# 42. SCOPE CONTROL

Before modifying a protected existing file, answer internally:

1. Why must this file change?
2. Can this be implemented without changing it?
3. What is the smallest modification?
4. What existing behavior could regress?
5. How will that behavior be tested?

Then proceed only when necessary.

---

# 43. DEFINITION OF DONE

Teacher Portal is NOT complete because pages exist.

It is complete when this works:

```text
Teacher authenticates
        ↓
Completes onboarding
        ↓
Refresh
        ↓
Profile remains
        ↓
Creates examination
        ↓
Uploads question paper
        ↓
Gemini parses securely
        ↓
Teacher reviews
        ↓
Publishes
        ↓
Refresh
        ↓
Exam remains
        ↓
Matching student sees exam
        ↓
Student analyzes answer sheet
        ↓
Existing Learning MRI succeeds
        ↓
Analysis linked to exam
        ↓
Teacher opens analytics
        ↓
Real student data appears
```

AND:

```text
npm run build
```

passes.

AND existing student flows still work.

That is the definition of done.

---

# 44. FINAL AUTONOMY RULE

Work autonomously within these boundaries.

Do not repeatedly ask for minor implementation decisions that can be resolved by:

1. inspecting existing code,
2. following established LearnLens patterns,
3. choosing the safest additive architecture.

STOP and ask for user input only when:

- destructive database changes are required,
- a secret/API credential is missing,
- a Supabase migration must be manually applied before continuing,
- requirements fundamentally conflict,
- there is genuine risk to production data,
- the repository does not contain enough information to make a safe decision.

Otherwise continue.

---

# 45. FINAL DIRECTIVE

Quality over speed.

Do not "vibe code."

Do not redesign the product.

Do not invent data.

Do not create architecture before inspecting architecture.

Do not modify protected systems for convenience.

Do not claim tests that were never executed.

Build the Teacher Portal as a production extension of the existing LearnLens product.

First audit.

Then plan.

Then implement vertical slices.

Then verify.

Then commit.

Proceed.
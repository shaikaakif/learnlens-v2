# LearnLens AI
> **See Beyond the Score.**

LearnLens AI is an AI-powered educational diagnostics platform that helps students, teachers, parents, and schools understand **why a student received a particular score**, where marks were lost, what patterns are recurring, and what the student should do next.

## Core Product Flow
School uploads Question Paper + optional Marking Scheme → Student selects the assessment → Student scans/uploads corrected Answer Sheet → Gemini multimodal AI analyzes the answer with assessment context → LearnLens creates structured diagnostics → Learning MRI → What Next? personalized learning context → Progress tracking.

## Technology
- Next.js/React + TypeScript + Tailwind CSS
- Responsive PWA
- Gemini multimodal API through a secure server endpoint
- Supabase PostgreSQL + Auth
- Optional Supabase Storage
- Vercel deployment

## Documentation Order
1. `docs/CONTEXT.md` — master source of truth
2. `docs/MVP_SCOPE.md` — competition implementation boundary
3. `docs/ARCHITECTURE.md` — technical design
4. `docs/AI_PIPELINE.md` — AI behavior and workflow
5. Remaining files for product, database, UX, business, privacy, and pitch

## Non-Negotiable
Never expose `GEMINI_API_KEY` or Supabase service-role credentials in client-side code.

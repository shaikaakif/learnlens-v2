# Technical Architecture

## MVP Stack
Frontend: Next.js/React, TypeScript, Tailwind CSS, PWA  
Backend: secure Next.js server routes or Node.js API  
Database: Supabase PostgreSQL  
Auth: Supabase Auth  
Optional storage: Supabase Storage  
AI: Gemini multimodal API  
Hosting: Vercel

## Main Flow
Browser → Secure backend → Authenticate/authorize → Retrieve assessment context → Send answer-sheet evidence + context to Gemini → Validate structured JSON → LearnLens diagnostic processing → Save structured analysis in Supabase → Return Learning MRI.

## Assessment Setup
Teacher → Create assessment → Upload question paper → Optional marking scheme → AI extracts question structure → Teacher verifies → Publish to class.

## Student Flow
Student → Login → Select assessment → Capture/upload corrected answer sheet → Backend retrieves question paper/rubric → Gemini analyzes → Structured JSON → Learning MRI → Save historical diagnostic data.

## Security
Never expose `GEMINI_API_KEY` or Supabase service-role key to the browser. Use server environment variables. Apply Supabase Row Level Security.

## Architectural Principle
The foundation model is one component. LearnLens owns the assessment workflow, context construction, diagnostic taxonomy, output validation, historical profiles, role-specific insights, and longitudinal analytics.

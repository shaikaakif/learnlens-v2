# LearnLens AI — Master Context

## Instruction to AI Coding Agents
This is the primary product source of truth. Read it before making product or architecture decisions. Do not turn LearnLens into a generic chatbot, OCR tool, autonomous grading system, or full school ERP.

## Identity
**Name:** LearnLens AI  
**Tagline:** See Beyond the Score.  
**Core statement:** A score tells you how a student performed. LearnLens helps you understand why.

## Origin Story
The idea began with a real student problem. A student may understand an English chapter and know the correct answers, yet lose marks through spelling, punctuation, capitalization, grammar, incomplete words, unclear letter formation, incomplete answers, weak structure, or question misinterpretation. A final score such as 31/40 compresses all of these possible causes into one number.

Two students can both score 31/40 while needing completely different interventions. One may need conceptual revision; another may need proofreading practice; another may struggle with application questions.

## Problem
- Students see scores but often lack systematic root-cause diagnosis.
- Teachers cannot manually track every recurring micro-error across every student and assessment at scale.
- Parents see marks but may not know what intervention is useful.
- Corrected answer sheets contain learning intelligence that is rarely structured longitudinally.

## Solution
LearnLens converts assessment evidence into a **Learning MRI** containing:
- strengths,
- conceptual gaps,
- application weaknesses,
- writing-mechanics patterns,
- careless/repeated errors,
- confidence-aware evidence,
- personalized next actions,
- longitudinal improvement trends.

## Assessment Context
An answer sheet alone is insufficient. The AI must know the corresponding questions.

### School Mode
Before or around the examination cycle, the teacher/school creates an assessment and uploads:
- question paper,
- subject,
- class/grade,
- assessment name,
- maximum marks,
- optional marking scheme/rubric/model answer.

The question paper is stored once and reused for all students taking that assessment.

After the examination, a logged-in student selects the relevant assessment and uploads/scans only the corrected answer sheet. LearnLens matches visible question numbers such as Q1, Q2(a), and Q3(b) to the stored assessment.

### Personal Mode
An independent user may provide:
- preferred name,
- class/grade,
- optional age,
- curriculum/board if relevant,
- question paper,
- answer sheet,
- optional marking scheme.

In School Mode, do not repeatedly ask for identity/class data already available in the account.

## Core Learning Loop
Assessment → Diagnosis → Learning MRI → Root-cause explanation → Recommended action → What Next? → External AI tutor context → Practice → Next assessment → Measure improvement → Update learning profile.

## What Next?
LearnLens generates a privacy-conscious learning context containing relevant strengths, weaknesses, recurring patterns, and goals. The student can copy it and continue learning in a preferred external AI assistant.

Do not depend on automatic prompt prefilling into third-party applications unless officially supported.

## Roles
**Student:** Why did I lose marks? What should I improve? Is this recurring?  
**Teacher:** What patterns exist across my class? Who needs targeted support?  
**Parent:** What is actually causing mark loss and how can I help?  
**School:** How can assessment data become actionable learning intelligence?

## Product Boundary
LearnLens is an educational diagnostic intelligence platform and B2B2C SaaS product.

It is NOT:
- a teacher replacement,
- an autonomous official examiner,
- a generic AI chatbot,
- a promise of perfect handwriting recognition,
- a system that fabricates precise metrics.

Teacher-awarded marks remain authoritative in school workflows.

## Privacy
Default MVP preference: process student answer-sheet images temporarily and retain structured diagnostic results rather than permanently retaining raw images. Question papers/rubrics may be privately stored because they are reused.

Third-party AI provider retention terms must be verified before making absolute privacy claims.

## Business
Primary customer: school/institution.  
Users: students, teachers, parents, administrators.  
Potential revenue: onboarding + annual SaaS + included AI usage + additional usage + optional integration/white-label services.

## Pitch Hook
“I scored 31 out of 40 in English. Can anyone tell me why I lost those nine marks?”

Then introduce:
**LearnLens AI — See Beyond the Score.**

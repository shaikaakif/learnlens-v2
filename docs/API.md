# Internal API Design

## POST /api/analyze
Input: assessment_id + temporary answer-sheet file(s).  
Server: authenticate → authorize → retrieve assessment context → call Gemini → validate JSON → store structured analysis.  
Output: analysis_id + Learning MRI.

## POST /api/assessments
Teacher/admin creates assessment.

## POST /api/assessments/:id/parse
Parse uploaded question paper.

## GET /api/assessments
Available assessments for current user.

## GET /api/analyses/:id
Authorized Learning MRI.

## POST /api/tutor-context
Generate privacy-conscious What Next? context.

## Rules
Validate inputs. Enforce authorization server-side. Rate-limit expensive AI routes. Validate model JSON before insertion. Avoid sensitive logging.

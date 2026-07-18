# Data Flow

## Assessment
Teacher uploads question paper → private storage → AI parses → structured questions saved → teacher verifies → assessment published.

## Answer Sheet
Student captures image → temporary client/server handling → secure backend → Gemini analysis with assessment context → structured result → Learning MRI saved → temporary raw file deleted when no longer needed, subject to actual provider/infrastructure behavior.

## Prefer Long-Term Storage Of
- assessment metadata,
- structured questions,
- official scores,
- diagnostic findings,
- confidence,
- learning profiles,
- progress trends.

Avoid permanent raw answer-sheet storage by default unless school policy requires it.

Important: deleting from LearnLens infrastructure does not prove deletion from third-party processing systems. Verify provider policies.

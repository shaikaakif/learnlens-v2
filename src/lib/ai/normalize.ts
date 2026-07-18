export function normalizeLearningMRI(parsedJson: any): any {
  if (typeof parsedJson !== 'object' || parsedJson === null) return parsedJson;

  const result = { ...parsedJson };

  // Normalize confidence fields safely
  if (result.assessmentSummary?.confidence) {
    result.assessmentSummary.confidence = result.assessmentSummary.confidence.toLowerCase().trim();
  }

  if (Array.isArray(result.questions)) {
    result.questions = result.questions.map((q: any) => {
      const nq = { ...q };

      // Handle teacherMarksDetected string to number
      if (typeof nq.teacherMarksDetected === 'string') {
        const parsedMark = parseFloat(nq.teacherMarksDetected);
        if (!isNaN(parsedMark)) {
          nq.teacherMarksDetected = parsedMark;
        }
      }

      // Handle questionNumber number to string
      if (typeof nq.questionNumber === 'number') {
        nq.questionNumber = nq.questionNumber.toString();
      }

      if (nq.transcriptionConfidence) {
        nq.transcriptionConfidence = nq.transcriptionConfidence.toLowerCase().trim();
      }

      if (Array.isArray(nq.issues)) {
        nq.issues = nq.issues.map((issue: any) => {
          const ni = { ...issue };
          if (ni.confidence) ni.confidence = ni.confidence.toLowerCase().trim();
          if (ni.category) ni.category = ni.category.toLowerCase().trim().replace(/\s+/g, '_');
          return ni;
        });
      }

      return nq;
    });
  }

  // Handle camelCase conversion mistakes by Gemini if it returns snake_case
  if (result.assessment_summary) {
    result.assessmentSummary = result.assessment_summary;
    delete result.assessment_summary;
  }
  if (result.primary_improvement_opportunities) {
    result.primaryImprovementOpportunities = result.primary_improvement_opportunities;
    delete result.primary_improvement_opportunities;
  }
  if (result.possible_mark_loss_patterns) {
    result.possibleMarkLossPatterns = result.possible_mark_loss_patterns;
    delete result.possible_mark_loss_patterns;
  }
  if (result.recommended_actions) {
    result.recommendedActions = result.recommended_actions;
    delete result.recommended_actions;
  }

  // Normalize old officialScore string to new score object
  if (typeof result.officialScore === 'string' && result.officialScore && !result.score) {
    const parts = result.officialScore.split('/');
    if (parts.length === 2) {
      result.score = {
        obtained: parseFloat(parts[0]),
        total: parseFloat(parts[1]),
        source: "official",
        confidence: "high",
        evidence: "Migrated from string field"
      };
    } else {
      result.score = {
        obtained: null,
        total: null,
        source: "not_detected",
        confidence: "medium"
      };
    }
  }

  // Normalize new score object strings to numbers
  if (result.score) {
    if (typeof result.score.obtained === 'string') result.score.obtained = parseFloat(result.score.obtained) || null;
    if (typeof result.score.total === 'string') result.score.total = parseFloat(result.score.total) || null;
  }

  // Ensure arrays exist
  result.strengths = Array.isArray(result.strengths) ? result.strengths : [];
  result.primaryImprovementOpportunities = Array.isArray(result.primaryImprovementOpportunities) ? result.primaryImprovementOpportunities : [];
  result.possibleMarkLossPatterns = Array.isArray(result.possibleMarkLossPatterns) ? result.possibleMarkLossPatterns : [];
  result.recommendedActions = Array.isArray(result.recommendedActions) ? result.recommendedActions : [];

  return result;
}

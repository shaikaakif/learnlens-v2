import { AiTutorControls } from '@/components/student/ai-tutor-controls';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertTriangle, TrendingUp, BookOpen, Brain, Sparkles, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { QualitativeLevel, ConfidenceLevel } from '@/types';
import { ExpandableIssue } from '@/components/student/expandable-issue';
import { InsightField } from '@/components/ui/insight-field';
import { db } from '@/lib/db';

export default async function LearningMRIPage(props: { params: Promise<{ analysisId: string }> }) {
  const params = await props.params;
  const { analysisId } = params;

  const mri = await db.getAnalysis(analysisId);
  
  if (!mri) {
    return (
      <div className="max-w-xl mx-auto mt-20 text-center space-y-6">
        <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
        <h1 className="text-2xl font-serif">Learning MRI Not Found</h1>
        <p className="text-muted-foreground">The analysis session may have expired or the ID is invalid. Please return to your assessments and re-analyze the answer sheet.</p>
        <Link href="/student/analyze">
          <Button variant="outline">Analyze a new answer sheet</Button>
        </Link>
      </div>
    );
  }

  const tutorContextText = `Act as my personalized tutor. I recently received an analysis for a ${mri.assessmentMetadata?.grade || ''} ${mri.assessmentMetadata?.subject || ''} assessment. ${mri.score?.obtained != null ? `My score was ${mri.score.obtained}/${mri.score.total}.` : ''}
My conceptual understanding is strong, particularly in: ${mri.strengths.join(', ')}. 
However, I need to focus on improving: ${mri.primaryImprovementOpportunities.join(', ')}.
Please provide a short practice exercise to help me work on these specific improvement areas.`;

  return (
    <div className="space-y-16 max-w-5xl mx-auto pb-20 animate-in fade-in duration-1000 slide-in-from-bottom-8">
      
      {/* SECTION 1: SCORE & HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-border/40 pb-8 relative z-10">
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold text-xs tracking-widest uppercase border border-primary/20">
            <Sparkles className="w-3 h-3" /> Diagnostic Complete
          </div>
          <h1 className="text-xl text-muted-foreground font-medium tracking-wide uppercase">{(mri as any).subjectDetected || 'Learning MRI'}</h1>
        </div>
        
        <div className="flex flex-col items-start md:items-end shrink-0">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
            {mri.score?.source === 'derived' ? 'Derived Score' : mri.score?.source === 'official' ? 'Official Score' : 'Score'}
          </span>
          {mri.score?.source === 'not_detected' || mri.score?.obtained == null ? (
            <div className="text-3xl font-serif text-muted-foreground tracking-tight pt-2">Score not detected</div>
          ) : (
            <div className="text-7xl md:text-8xl font-serif text-foreground leading-none flex items-baseline tracking-tighter">
              {mri.score.obtained}<span className="text-4xl md:text-5xl text-muted-foreground/50 font-sans tracking-normal">/{mri.score.total}</span>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: PRIMARY INSIGHT (Hero Moment) */}
      <div className="relative rounded-3xl overflow-hidden bg-background border border-primary/10 shadow-2xl shadow-primary/5">
        <InsightField variant="subtle" interactive={false} className="opacity-70" />
        <div className="relative z-10 p-10 md:p-16 text-center max-w-4xl mx-auto space-y-6">
          <Brain className="w-8 h-8 text-primary mx-auto opacity-80" />
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-foreground leading-[1.2] text-balance">
            "{mri.assessmentSummary.overallObservation}"
          </h2>
          <p className="text-sm font-semibold tracking-widest uppercase text-primary pt-4">Primary Insight</p>
        </div>
      </div>

      {/* SECTION 3: STRENGTHS & FOCUS AREAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-8 relative z-10">
        <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-both">
          <h3 className="text-xl font-semibold tracking-wide uppercase text-muted-foreground flex items-center gap-3 relative z-10">
            <CheckCircle2 className="w-5 h-5 text-success" /> Validated Strengths
          </h3>
          <Card className="h-auto md:h-full border-border/40 shadow-sm bg-white/60 backdrop-blur-sm hover:shadow-md transition-shadow relative z-0">
            <CardContent className="p-6 md:p-8 space-y-5">
              <ul className="space-y-4 md:space-y-5">
                {mri.strengths.map((strength, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-success mt-2.5 shrink-0" />
                    <span className="text-foreground/90 text-base md:text-lg">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both pt-2 md:pt-0">
          <h3 className="text-xl font-semibold tracking-wide uppercase text-muted-foreground flex items-center gap-3 relative z-10">
            <TrendingUp className="w-5 h-5 text-primary" /> Focus Areas
          </h3>
          <Card className="h-auto md:h-full border-border/40 shadow-sm bg-white/60 backdrop-blur-sm hover:shadow-md transition-shadow relative z-0">
            <CardContent className="p-6 md:p-8 space-y-5">
              <ul className="space-y-4 md:space-y-5">
                {mri.primaryImprovementOpportunities.map((opp, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 shrink-0" />
                    <span className="text-foreground/90 text-base md:text-lg">{opp}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* SECTION 4: DETAILED EVIDENCE */}
      <div className="space-y-6 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400 fill-mode-both">
        <div className="space-y-1">
          <h3 className="text-2xl font-serif text-foreground flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-warning" /> Mark Loss Evidence
          </h3>
          <p className="text-muted-foreground text-base">Evidence-driven diagnostic reasoning for evaluated questions.</p>
        </div>
        
        {mri.questions.filter(q => q.issues && q.issues.length > 0).length === 0 ? (
          <Card className="border-border/40 bg-emerald-500/5 shadow-sm p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-500/20">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xl font-serif font-bold text-foreground">
                No measurable mark deductions were detected.
              </h4>
              <p className="text-muted-foreground max-w-lg mx-auto text-sm leading-relaxed">
                Your answer sheet demonstrated strong mastery with no significant loss of marks across evaluated questions.
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6">
            {mri.questions.filter(q => q.issues && q.issues.length > 0).map((q, i) => (
              <Card key={i} className="overflow-hidden shadow-sm border-border/40 hover:border-primary/20 transition-colors">
                <div className="bg-muted/30 px-6 py-4 border-b border-border/40 flex justify-between items-center">
                  <span className="font-semibold text-foreground text-lg flex items-center gap-2">
                    Question {q.questionNumber}
                  </span>
                  <Badge variant="outline" className="bg-background/80 text-sm font-medium border-primary/20 text-primary">
                    Marks Detected: {q.teacherMarksDetected ?? 'Evaluated'}
                  </Badge>
                </div>
                <CardContent className="p-0">
                  <div className="divide-y divide-border/40">
                    {q.issues?.map((issue, j) => (
                      <ExpandableIssue key={j} issue={{ ...issue, transcription: q.transcription }} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 5: RECOMMENDED ACTION */}
      <div className="space-y-6 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500 fill-mode-both">
        <h3 className="text-2xl font-serif text-foreground flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-primary" /> Recommended Next Steps
        </h3>
        <Card className="border-border/40 bg-primary/5">
          <CardContent className="p-8">
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              {mri.recommendedActions.map((action, i) => (
                <div key={i} className="bg-white p-6 rounded-xl border border-primary/10 shadow-sm text-foreground/90 font-medium leading-relaxed">
                  {action}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SECTION 6: WHAT NEXT? */}
      <div className="mt-16 p-10 md:p-12 bg-foreground text-background rounded-3xl shadow-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700 fill-mode-both relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full mix-blend-screen filter blur-[100px] pointer-events-none" />
        
        <div className="space-y-4 relative z-10">
          <h3 className="text-3xl font-serif text-white">Continue with AI Tutor</h3>
          <p className="text-background/70 max-w-2xl text-lg leading-relaxed">
            Take this personalized learning context to your favorite AI tutor to generate practice exercises targeted exactly at your weak points.
          </p>
        </div>
        
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 font-mono text-sm leading-relaxed text-white/90 break-words relative z-10">
          {tutorContextText}
        </div>
        
        <AiTutorControls promptText={tutorContextText} />
      </div>
    </div>
  );
}

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, BarChart3, Users, Award, BookOpen, 
  FileText, Sparkles, TrendingUp, CheckCircle2, AlertCircle, ShieldCheck, Target
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function TeacherExamAnalytics({ params }: { params: Promise<{ examId: string }> }) {
  const { examId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/teacher/login');
  }

  // 1. Fetch exam details and verify ownership
  const { data: exam } = await supabase
    .from('exams')
    .select('*')
    .eq('id', examId)
    .eq('teacher_id', user.id)
    .maybeSingle();

  if (!exam) {
    redirect('/teacher/dashboard');
  }

  // 2. Fetch linked student analyses safely
  const { data: analyses } = await supabase
    .from('analyses')
    .select('*')
    .eq('exam_id', examId)
    .order('created_at', { ascending: false });

  const submissions = analyses || [];
  const submissionCount = submissions.length;

  // 3. Fetch student names for linked submissions
  let studentMap = new Map<string, string>();
  if (submissionCount > 0) {
    const studentIds = Array.from(new Set(submissions.map((s) => s.user_id).filter(Boolean)));
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', studentIds);

    if (profiles) {
      studentMap = new Map(profiles.map((p) => [p.id, p.full_name]));
    }
  }

  // Compute real metrics
  let totalObtained = 0;
  let totalPossible = 0;
  let maxPct = 0;
  let minPct = 100;
  const strengthsSet = new Set<string>();
  const improvementsSet = new Set<string>();

  submissions.forEach((item) => {
    const obtained = parseFloat(item.score_obtained) || 0;
    const total = parseFloat(item.score_total) || 100;
    totalObtained += obtained;
    totalPossible += total;

    const pct = total > 0 ? (obtained / total) * 100 : 0;
    if (pct > maxPct) maxPct = pct;
    if (pct < minPct) minPct = pct;

    const mri = item.analysis_data || {};
    if (Array.isArray(mri.strengths)) {
      mri.strengths.forEach((s: string) => strengthsSet.add(s));
    }
    if (Array.isArray(mri.primaryImprovementOpportunities)) {
      mri.primaryImprovementOpportunities.forEach((imp: string) => improvementsSet.add(imp));
    } else if (Array.isArray(mri.opportunities)) {
      mri.opportunities.forEach((imp: string) => improvementsSet.add(imp));
    }
  });

  const avgObtained = submissionCount > 0 ? (totalObtained / submissionCount).toFixed(1) : '0';
  const avgPct = submissionCount > 0 && totalPossible > 0 ? ((totalObtained / totalPossible) * 100).toFixed(1) : '0';

  const strengthsList = Array.from(strengthsSet).slice(0, 4);
  const improvementsList = Array.from(improvementsSet).slice(0, 4);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20">
      {/* Navigation Header */}
      <header className="bg-white border-b border-border/80 px-4 md:px-8 py-4 flex items-center justify-between shadow-sm sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link
            href={`/teacher/exams/${examId}`}
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors bg-white border border-border/80 px-3.5 py-1.5 rounded-full shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Exam
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
            exam.status === 'PUBLISHED' 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}>
            {exam.status}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8 space-y-8">
        {/* Banner */}
        <div className="bg-white/90 p-6 md:p-8 rounded-3xl border border-primary/20 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-primary font-bold">
            <BarChart3 className="w-4 h-4" />
            <span>Class Performance Analytics</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground">{exam.title}</h1>
          <p className="text-sm text-muted-foreground">
            {exam.subject} • {exam.class_level} ({exam.section || 'A'})
          </p>
        </div>

        {/* Real Overview Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-white border-border/80 shadow-sm rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Submissions</CardTitle>
              <Users className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-serif">{submissionCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Student answer sheets analyzed</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-border/80 shadow-sm rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Class Average Score</CardTitle>
              <Award className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-serif">{avgObtained}</div>
              <p className="text-xs text-muted-foreground mt-1">{avgPct}% overall class average</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-border/80 shadow-sm rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Score Range</CardTitle>
              <TrendingUp className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-serif">
                {submissionCount > 0 ? `${minPct.toFixed(0)}% – ${maxPct.toFixed(0)}%` : '0%'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Lowest to highest student score</p>
            </CardContent>
          </Card>
        </div>

        {/* Learning MRI Evidence Breakdown */}
        {submissionCount > 0 && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-white border-border/80 shadow-sm rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-sm font-serif font-bold text-foreground">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Class Concept Strengths</span>
              </div>
              {strengthsList.length > 0 ? (
                <ul className="space-y-2 text-xs">
                  {strengthsList.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 bg-emerald-50 text-emerald-900 p-2.5 rounded-xl border border-emerald-200/60 font-medium">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground">Analyses complete.</p>
              )}
            </Card>

            <Card className="bg-white border-border/80 shadow-sm rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-sm font-serif font-bold text-foreground">
                <Target className="w-4 h-4 text-amber-600" />
                <span>Key Improvement Opportunities</span>
              </div>
              {improvementsList.length > 0 ? (
                <ul className="space-y-2 text-xs">
                  {improvementsList.map((imp, i) => (
                    <li key={i} className="flex items-start gap-2 bg-amber-50 text-amber-900 p-2.5 rounded-xl border border-amber-200/60 font-medium">
                      <span className="text-amber-600 font-bold">!</span>
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground">Analyses complete.</p>
              )}
            </Card>
          </div>
        )}

        {/* Submissions List / Intentional Empty State */}
        <div className="space-y-4">
          <h2 className="text-xl font-serif font-bold text-foreground">Student Submissions</h2>

          {submissionCount === 0 ? (
            <Card className="border-dashed border-2 border-border/80 bg-white/50 p-8 text-center rounded-3xl space-y-3">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-serif font-bold text-foreground">No student submissions yet</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Student insights will appear after students analyze their answer sheets for this examination.
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {submissions.map((sub) => {
                const studentName = studentMap.get(sub.user_id) || 'Student';
                return (
                  <Card key={sub.id} className="bg-white border-border/80 shadow-sm p-4 flex items-center justify-between rounded-2xl hover:border-primary/40 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/15 rounded-xl flex items-center justify-center text-primary font-bold text-sm">
                        {studentName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{studentName}</p>
                        <p className="text-xs text-muted-foreground">
                          Submitted on {new Date(sub.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-sm font-bold font-serif text-foreground">
                          {sub.score_obtained || 0} / {sub.score_total || 100}
                        </span>
                        <span className="text-xs text-muted-foreground block font-mono">
                          {((parseFloat(sub.score_obtained || 0) / parseFloat(sub.score_total || 100)) * 100).toFixed(0)}%
                        </span>
                      </div>

                      <Link href={`/student/learning-mri/${sub.id}`}>
                        <Button variant="outline" size="sm" className="rounded-xl text-xs font-semibold">
                          View MRI →
                        </Button>
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

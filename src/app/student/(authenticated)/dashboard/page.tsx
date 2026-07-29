import { db } from '@/lib/db';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { BookOpen, ArrowRight, Sparkles, FileText } from 'lucide-react';

export const revalidate = 0; // Ensure dashboard always fetches fresh data

export default async function StudentDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/student/login');
  }
  
  const { data: analyses } = await supabase
    .from('analyses')
    .select('id, created_at, subject_detected, score_obtained, score_total, analysis_data')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const latestAnalysis = analyses && analyses.length > 0 ? analyses[0] : null;

  // Fetch profile for the current authenticated student
  const profile = await db.getProfile();
  const studentGrade = profile?.grade || 'Class 10';

  // Query real PUBLISHED teacher examinations matching the student's grade level
  const { data: publishedExams } = await supabase
    .from('exams')
    .select('id, title, subject, class_level, section, teacher_id, created_at')
    .eq('status', 'PUBLISHED')
    .eq('class_level', studentGrade)
    .order('created_at', { ascending: false });

  let activeExams: any[] = [];
  if (publishedExams && publishedExams.length > 0) {
    const teacherIds = Array.from(new Set(publishedExams.map((e) => e.teacher_id).filter(Boolean)));
    const { data: teachers } = await supabase
      .from('teacher_profiles')
      .select('user_id, full_name')
      .in('user_id', teacherIds);

    const teacherMap = new Map(teachers?.map((t) => [t.user_id, t.full_name]) || []);

    activeExams = publishedExams.map((e) => ({
      ...e,
      teacher_name: teacherMap.get(e.teacher_id) || 'Educator',
    }));
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto font-sans">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-primary/5 p-6 rounded-3xl border border-primary/15 shadow-sm">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">Welcome back, {profile?.full_name || 'Student'}</h1>
          <p className="text-sm text-muted-foreground mt-1">{studentGrade} • {profile?.board || 'CBSE Board'}</p>
        </div>
        <Link href="/student/analyze" className="w-full md:w-auto shrink-0">
          <Button size="lg" className="relative w-full text-sm font-semibold tracking-wide rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all group overflow-hidden bg-primary text-primary-foreground h-12 px-6">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
            <Sparkles className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
            <span>Analyze General Answer Sheet</span>
          </Button>
        </Link>
      </div>

      {/* Active Class Examinations Section (TP-V1.7) */}
      {activeExams.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif font-bold text-foreground flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <span>Active Class Examinations</span>
            </h2>
            <span className="text-xs font-mono text-muted-foreground">{activeExams.length} Published</span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {activeExams.map((exam) => (
              <Card key={exam.id} className="bg-white border-primary/30 shadow-sm hover:border-primary/60 hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4 rounded-2xl">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {exam.subject}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">
                      {exam.class_level} ({exam.section || 'A'})
                    </span>
                  </div>
                  <h3 className="text-lg font-serif font-bold text-foreground line-clamp-1">{exam.title}</h3>
                  <p className="text-xs text-muted-foreground">Created by {exam.teacher_name}</p>
                </div>

                <Link href={`/student/analyze?examId=${exam.id}`} className="w-full pt-2">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-10 rounded-xl shadow-sm gap-2">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Analyze Answer Sheet for this Exam</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Main Student History / MRI Section */}
      {!latestAnalysis ? (
        <Card className="border-dashed border-2 border-primary/20 bg-primary/5 text-center py-12 rounded-3xl">
          <CardContent className="space-y-6">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/15 text-primary flex items-center justify-center shadow-inner">
              <BookOpen className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-serif font-bold text-foreground">No analyses yet</h2>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">Upload your first answer sheet and let LearnLens AI generate a personalized Learning MRI for you.</p>
            </div>
            <Link href="/student/analyze" className="inline-block mt-4">
              <Button size="lg" className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm">
                Analyze your first answer sheet
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-white border-border/80 shadow-sm rounded-2xl">
            <CardHeader>
              <CardTitle className="font-serif">Recent Assessment</CardTitle>
              <CardDescription>{latestAnalysis.subject_detected}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {latestAnalysis.score_obtained ? (
                <div className="text-3xl font-bold font-serif">{latestAnalysis.score_obtained}<span className="text-lg text-muted-foreground font-normal">/{latestAnalysis.score_total || '100'}</span></div>
              ) : (
                <div className="text-muted-foreground italic text-sm">Score Not Detected</div>
              )}
              <Link href={`/student/learning-mri/${latestAnalysis.id}`}>
                <Button className="w-full rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs">View Learning MRI</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-white border-border/80 shadow-sm rounded-2xl">
            <CardHeader>
              <CardTitle className="font-serif">New Analysis</CardTitle>
              <CardDescription>Ready for your next submission</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground mb-4">Upload any answer sheet to automatically detect subject and analyze performance.</p>
              <Link href="/student/analyze" className="block">
                <Button variant="outline" className="w-full rounded-xl text-xs font-semibold">Analyze Answer Sheet</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-white border-border/80 shadow-sm rounded-2xl">
            <CardHeader>
              <CardTitle className="font-serif">Progress Snapshot</CardTitle>
              <CardDescription>Your recent trends</CardDescription>
            </CardHeader>
            <CardContent>
              {latestAnalysis.analysis_data?.strengths?.length > 0 ? (
                <ul className="space-y-2 text-xs">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="truncate">{latestAnalysis.analysis_data.strengths[0]}</span>
                  </li>
                  {latestAnalysis.analysis_data?.primaryImprovementOpportunities?.length > 0 && (
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                      <span className="truncate">{latestAnalysis.analysis_data.primaryImprovementOpportunities[0]}</span>
                    </li>
                  )}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground">Analyze more tests to build progress.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

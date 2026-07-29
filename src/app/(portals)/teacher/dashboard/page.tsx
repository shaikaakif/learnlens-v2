import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, BookOpen, Layers, UserCheck, Calendar, FileText } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MobileHeader } from '@/components/teacher/mobile-header';
import { MobileCard } from '@/components/teacher/mobile-card';

export default async function TeacherDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/teacher/login');
  }

  // Fetch teacher profile directly (without relational joins)
  const { data: profile } = await supabase
    .from('teacher_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!profile) {
    redirect('/teacher/onboarding');
  }

  // Fetch teacher classes separately
  const { data: classesData } = await supabase
    .from('teacher_classes')
    .select('class_level, section')
    .eq('teacher_id', profile.id);

  const classesTaughtList = classesData ? classesData.map((c) => c.class_level) : [];

  let schoolName = 'Educator Account';
  if (profile.school_id) {
    const { data: school } = await supabase
      .from('schools')
      .select('name')
      .eq('id', profile.school_id)
      .maybeSingle();
    if (school?.name) {
      schoolName = school.name;
    }
  }

  // Fetch real examinations created by this teacher
  const { data: exams } = await supabase
    .from('exams')
    .select('*')
    .eq('teacher_id', user.id)
    .order('created_at', { ascending: false });

  const realExams = exams || [];
  const publishedCount = realExams.filter((e) => e.status === 'PUBLISHED').length;
  const draftCount = realExams.filter((e) => e.status === 'DRAFT').length;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20 overflow-x-hidden">
      {/* Mobile-First Stacking Navigation Header */}
      <MobileHeader schoolName={schoolName} />

      {/* Main Content Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 space-y-6 md:space-y-8">
        {/* Welcome Banner Card */}
        <MobileCard className="p-5 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5 border border-primary/20">
          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-widest text-primary font-bold">Educator Overview</span>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">Good morning, {profile.full_name}</h2>
            <p className="text-xs md:text-sm text-muted-foreground">
              {profile.primary_subject} • {classesTaughtList.join(', ') || 'Class Instructor'}
            </p>
          </div>

          <Link href="/teacher/exams/create" className="w-full md:w-auto">
            <Button size="lg" className="w-full md:w-auto h-12 min-h-[48px] px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow-md shadow-primary/20 flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" />
              <span>Create Examination</span>
            </Button>
          </Link>
        </MobileCard>

        {/* Real Overview Stats (1-Column on Mobile, Grid on Desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          <Card className="bg-white border-border/80 shadow-sm rounded-2xl p-4 md:p-6">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-0 mb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Total Examinations</CardTitle>
              <BookOpen className="w-4 h-4 text-primary shrink-0" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="text-2xl font-bold font-serif">{realExams.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {publishedCount} Published • {draftCount} Drafts
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-border/80 shadow-sm rounded-2xl p-4 md:p-6">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-0 mb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Classes Taught</CardTitle>
              <Layers className="w-4 h-4 text-primary shrink-0" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="text-2xl font-bold font-serif">{classesTaughtList.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Configured grade levels</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-border/80 shadow-sm rounded-2xl p-4 md:p-6 sm:col-span-2 md:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-0 mb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Primary Subject</CardTitle>
              <UserCheck className="w-4 h-4 text-primary shrink-0" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="text-2xl font-bold font-serif">{profile.primary_subject}</div>
              <p className="text-xs text-muted-foreground mt-1">Assigned discipline</p>
            </CardContent>
          </Card>
        </div>

        {/* Examinations List / Mobile-Optimized Empty State */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg md:text-xl font-serif font-bold text-foreground">Your Examinations</h3>
            {realExams.length > 0 && (
              <span className="text-xs font-mono text-muted-foreground">{realExams.length} Total</span>
            )}
          </div>

          {realExams.length === 0 ? (
            <Card className="border-dashed border-2 border-border/80 bg-white/50 p-6 md:p-10 text-center rounded-3xl space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base md:text-lg font-serif font-bold text-foreground">No examinations yet</h4>
                <p className="text-xs md:text-sm text-muted-foreground max-w-md mx-auto">
                  Create your first examination to start receiving learning insights from your students.
                </p>
              </div>
              <div className="pt-2">
                <Link href="/teacher/exams/create" className="inline-block w-full sm:w-auto">
                  <Button className="w-full sm:w-auto h-12 min-h-[48px] px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm">
                    Create Examination
                  </Button>
                </Link>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {realExams.map((exam) => (
                <Link key={exam.id} href={`/teacher/exams/${exam.id}`} className="block group">
                  <Card className="bg-white border-border/80 shadow-sm hover:border-primary/50 hover:shadow-md transition-all cursor-pointer rounded-2xl p-4 md:p-5 flex flex-col justify-between space-y-4 min-h-[140px]">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                          exam.status === 'PUBLISHED' 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {exam.status}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(exam.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <CardTitle className="text-base md:text-lg font-serif font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                        {exam.title}
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        {exam.subject} • {exam.class_level} ({exam.section || 'A'})
                      </CardDescription>
                    </div>

                    <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
                        {exam.question_paper_path ? 'Paper Uploaded' : 'Metadata Only'}
                      </span>
                      <span className="font-semibold text-primary group-hover:underline">Manage →</span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

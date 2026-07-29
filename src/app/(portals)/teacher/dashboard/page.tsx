import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Users, LogOut, Plus, BookOpen, Layers, UserCheck, Calendar, FileText, Settings } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { teacherLogout } from '@/app/actions/teacher-auth';

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
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20">
      {/* Top Navigation Header */}
      <header className="bg-white border-b border-border/80 px-4 md:px-8 py-4 flex items-center justify-between shadow-sm sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/15 rounded-xl flex items-center justify-center text-primary font-bold shadow-inner">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-serif font-bold text-foreground">Teacher Portal</h1>
            <p className="text-xs text-muted-foreground">{schoolName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/teacher/profile">
            <Button variant="outline" size="sm" className="gap-2 rounded-xl text-xs font-semibold border-border/80">
              <Settings className="w-3.5 h-3.5" />
              <span>Profile Settings</span>
            </Button>
          </Link>

          <form action={teacherLogout}>
            <Button variant="ghost" size="sm" type="submit" className="gap-2 text-muted-foreground hover:text-foreground">
              <LogOut className="w-4 h-4" /> Sign Out
            </Button>
          </form>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/90 p-6 md:p-8 rounded-3xl border border-primary/20 shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-widest text-primary font-bold">Educator Overview</span>
            <h2 className="text-3xl font-serif font-bold text-foreground">Good morning, {profile.full_name}</h2>
            <p className="text-sm text-muted-foreground">
              {profile.primary_subject} • {classesTaughtList.join(', ') || 'Class Instructor'}
            </p>
          </div>

          <Link href="/teacher/exams/create">
            <Button size="lg" className="h-12 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow-md shadow-primary/20 gap-2">
              <Plus className="w-4 h-4" />
              <span>Create Examination</span>
            </Button>
          </Link>
        </div>

        {/* Real Overview Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-white border-border/80 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Examinations</CardTitle>
              <BookOpen className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-serif">{realExams.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {publishedCount} Published • {draftCount} Drafts
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-border/80 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Classes Taught</CardTitle>
              <Layers className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-serif">{classesTaughtList.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Configured grade levels</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-border/80 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Primary Subject</CardTitle>
              <UserCheck className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-serif">{profile.primary_subject}</div>
              <p className="text-xs text-muted-foreground mt-1">Assigned discipline</p>
            </CardContent>
          </Card>
        </div>

        {/* Examinations List / Empty State */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-serif font-bold text-foreground">Your Examinations</h3>
            {realExams.length > 0 && (
              <span className="text-xs font-mono text-muted-foreground">{realExams.length} Total</span>
            )}
          </div>

          {realExams.length === 0 ? (
            <Card className="border-dashed border-2 border-border/80 bg-white/50 p-8 text-center rounded-3xl space-y-3">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-serif font-bold text-foreground">No examinations yet</h4>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Create your first examination to start receiving learning insights from your students.
                </p>
              </div>
              <div className="pt-2">
                <Link href="/teacher/exams/create">
                  <Button className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm">
                    Create Examination
                  </Button>
                </Link>
              </div>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {realExams.map((exam) => (
                <Link key={exam.id} href={`/teacher/exams/${exam.id}`} className="block group">
                  <Card className="bg-white border-border/80 shadow-sm hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
                    <CardHeader className="pb-3 space-y-2">
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
                      <CardTitle className="text-lg font-serif font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                        {exam.title}
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        {exam.subject} • {exam.class_level} ({exam.section || 'A'})
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0 text-xs text-muted-foreground flex items-center justify-between border-t border-border/40 mt-3 pt-3">
                      <span className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-primary" />
                        {exam.question_paper_path ? 'Paper Uploaded' : 'Metadata Only'}
                      </span>
                      <span className="font-semibold text-primary group-hover:underline">Manage →</span>
                    </CardContent>
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

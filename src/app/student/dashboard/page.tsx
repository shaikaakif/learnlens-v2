import { DEMO_STUDENT_ID } from '@/lib/constants';
import { db } from '@/lib/db';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getSupabaseServerClient } from '@/lib/db/supabase';

export const revalidate = 0; // Ensure dashboard always fetches fresh data

export default async function StudentDashboard() {
  const supabase = getSupabaseServerClient();
  
  const { data: analyses, error } = await supabase
    .from('analyses')
    .select('id, created_at, subject_detected, score_obtained, score_total, analysis_data')
    .eq('student_id', DEMO_STUDENT_ID)
    .order('created_at', { ascending: false });

  const latestAnalysis = analyses && analyses.length > 0 ? analyses[0] : null;

  const profile = await db.getProfile(DEMO_STUDENT_ID);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {profile?.full_name || 'Student'}</h1>
          <p className="text-muted-foreground">{profile?.grade || 'Class 10'} • {profile?.board || 'CBSE'}</p>
        </div>
      </div>

      {!latestAnalysis ? (
        <Card className="border-dashed border-2 border-primary/20 bg-primary/5 text-center py-12">
          <CardContent className="space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-2xl">📝</span>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-serif text-foreground">No analyses yet</h2>
              <p className="text-muted-foreground max-w-md mx-auto">Upload your first answer sheet and let LearnLens AI generate a personalized Learning MRI for you.</p>
            </div>
            <Link href="/student/analyze" className="inline-block mt-4">
              <Button size="lg">Analyze your first answer sheet</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Recent Assessment</CardTitle>
              <CardDescription>{latestAnalysis.subject_detected}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {latestAnalysis.score_obtained ? (
                <div className="text-3xl font-bold">{latestAnalysis.score_obtained}<span className="text-lg text-muted-foreground font-normal">/{latestAnalysis.score_total || '100'}</span></div>
              ) : (
                <div className="text-3xl font-bold text-muted-foreground italic text-lg">Score Not Detected</div>
              )}
              <Link href={`/student/learning-mri/${latestAnalysis.id}`}>
                <Button className="w-full">View Learning MRI</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>New Analysis</CardTitle>
              <CardDescription>Ready for your next submission</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground mb-4">Upload any answer sheet to automatically detect subject and analyze performance.</p>
              <Link href="/student/analyze" className="block">
                <Button variant="outline" className="w-full">Analyze Answer Sheet</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Progress Snapshot</CardTitle>
              <CardDescription>Your recent trends</CardDescription>
            </CardHeader>
            <CardContent>
              {latestAnalysis.analysis_data?.strengths?.length > 0 ? (
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-success shrink-0" />
                    <span className="truncate">{latestAnalysis.analysis_data.strengths[0]}</span>
                  </li>
                  {latestAnalysis.analysis_data?.primaryImprovementOpportunities?.length > 0 && (
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-warning shrink-0" />
                      <span className="truncate">{latestAnalysis.analysis_data.primaryImprovementOpportunities[0]}</span>
                    </li>
                  )}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Analyze more tests to build progress.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

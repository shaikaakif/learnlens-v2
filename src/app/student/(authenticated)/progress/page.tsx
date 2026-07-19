import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, TrendingUp, Calendar, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { LearningMRI } from '@/types';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ProgressPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/student/login');
  }

  const { data: analyses, error } = await supabase
    .from('analyses')
    .select('id, created_at, subject_detected, score_obtained, score_total, analysis_data')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching progress:', error);
  }

  const hasAnalyses = analyses && analyses.length > 0;

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-20 md:pb-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Activity className="w-8 h-8 text-primary" /> Progress History
        </h1>
        <p className="text-muted-foreground">Longitudinal tracking of your diagnostic patterns from real analyses.</p>
      </div>

      {!hasAnalyses ? (
        <Card className="text-center p-10 border-dashed">
          <div className="flex flex-col items-center gap-4">
            <Activity className="w-12 h-12 text-muted-foreground/50" />
            <h3 className="text-xl font-medium">No progress data yet</h3>
            <p className="text-muted-foreground max-w-sm">Complete your first Learning MRI analysis to start tracking your progress here.</p>
            <Link href="/student/analyze" className="mt-4 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4">
              Analyze an Answer Sheet
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent pt-4">
          {analyses.map((record, index) => {
            const mri = record.analysis_data as LearningMRI;
            const dateStr = new Date(record.created_at).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric'
            });

            return (
              <div key={record.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-primary text-primary-foreground shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-transform group-hover:scale-110">
                  <TrendingUp className="w-4 h-4" />
                </div>
                
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4">
                  <Link href={`/student/learning-mri/${record.id}`}>
                    <Card className="hover:border-primary/40 hover:shadow-md transition-all group/card cursor-pointer">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg group-hover/card:text-primary transition-colors flex items-center gap-2">
                              {record.subject_detected}
                              <ArrowRight className="w-4 h-4 opacity-0 -ml-2 group-hover/card:opacity-100 group-hover/card:ml-0 transition-all" />
                            </CardTitle>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                              <Calendar className="w-3 h-3" /> {dateStr}
                            </div>
                          </div>
                          {record.score_obtained && (
                            <Badge variant="outline" className="text-sm font-serif">
                              {record.score_obtained} {record.score_total ? `/ ${record.score_total}` : ''}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-sm font-medium line-clamp-2 text-foreground/80 italic">
                          "{mri.assessmentSummary?.overallObservation}"
                        </div>
                        
                        <div className="space-y-3 pt-2 border-t border-border/50">
                          {mri.strengths && mri.strengths.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Strengths</p>
                              <div className="flex flex-wrap gap-1">
                                {mri.strengths.slice(0, 2).map((s, i) => (
                                  <Badge key={i} variant="secondary" className="bg-success/10 text-success hover:bg-success/20 font-normal text-xs">{s.substring(0, 30)}{s.length > 30 ? '...' : ''}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {mri.primaryImprovementOpportunities && mri.primaryImprovementOpportunities.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Focus Areas</p>
                              <div className="flex flex-wrap gap-1">
                                {mri.primaryImprovementOpportunities.slice(0, 2).map((opp, i) => (
                                  <Badge key={i} variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 font-normal text-xs">{opp.substring(0, 30)}{opp.length > 30 ? '...' : ''}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

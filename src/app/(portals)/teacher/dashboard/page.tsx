import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, FileText, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function TeacherDashboard() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('demo_auth');

  if (!authCookie || authCookie.value !== 'authenticated') {
    redirect('/teacher/login');
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background border-b border-border p-4 px-6 flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Teacher Portal
        </h2>
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
            <LogOut className="w-4 h-4" /> Exit
          </Button>
        </Link>
      </header>

      <main className="max-w-6xl mx-auto p-6 md:p-10 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Class Overview</h1>
          <p className="text-muted-foreground">Class 10 English • 32 Students</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Assessments</CardTitle>
              <CardDescription>English Periodic Test</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">24 / 32</p>
              <p className="text-sm text-muted-foreground">Submissions analyzed</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Class Strengths</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2">
                <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-success"></span> Reading Comprehension</li>
                <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-success"></span> Plot Recall</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Common Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2">
                <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-warning"></span> Letter Formatting (45% of class)</li>
                <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-destructive"></span> Missing Punctuation</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

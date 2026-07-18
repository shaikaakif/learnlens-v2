import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, LogOut, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('demo_auth');

  if (!authCookie || authCookie.value !== 'authenticated') {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background border-b border-border p-4 px-6 flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Settings className="w-5 h-5 text-foreground" />
          Admin Portal
        </h2>
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
            <LogOut className="w-4 h-4" /> Exit
          </Button>
        </Link>
      </header>

      <main className="max-w-6xl mx-auto p-6 md:p-10 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">System Configuration</h1>
          <p className="text-muted-foreground">LearnLens Platform Administration</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Manage teachers, students, and roles.</p>
              <Button variant="outline" className="w-full">Manage Users</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Assessment Repository</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Manage rubrics and marking schemes.</p>
              <Button variant="outline" className="w-full">View Repository</Button>
            </CardContent>
          </Card>
          
          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <ShieldAlert className="w-5 h-5" /> API Keys
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Manage Gemini API integration securely.</p>
              <Button variant="destructive" className="w-full">Manage Secrets</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

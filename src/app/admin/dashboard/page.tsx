import { createClient as createAdminClient } from '@supabase/supabase-js';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Settings, LogOut, Users, Activity, FileText, Smartphone } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

async function getAdminData() {
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Users
  const { data: allUsers } = await adminClient.auth.admin.listUsers();
  const totalUsers = allUsers?.users.length || 0;
  
  const now = new Date();
  const today = new Date(now.setHours(0,0,0,0)).toISOString();
  
  const newUsersToday = allUsers?.users.filter(u => u.created_at >= today).length || 0;

  // Active Users (simplified from analytics events)
  const { data: recentEvents } = await adminClient
    .from('analytics_events')
    .select('user_id, created_at')
    .not('user_id', 'is', null)
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  const uniqueDau = new Set();
  const uniqueWau = new Set();
  const uniqueMau = new Set();

  if (recentEvents) {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).getTime();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).getTime();

    recentEvents.forEach(e => {
      const time = new Date(e.created_at).getTime();
      uniqueMau.add(e.user_id);
      if (time >= sevenDaysAgo) uniqueWau.add(e.user_id);
      if (time >= oneDayAgo) uniqueDau.add(e.user_id);
    });
  }

  // Analyses
  const { data: analyses } = await adminClient.from('analyses').select('id, created_at, status, subject_detected').order('created_at', { ascending: false });
  const totalAnalyses = analyses?.length || 0;
  const analysesToday = analyses?.filter(a => a.created_at >= today).length || 0;

  // PWA Installs
  const { count: pwaInstalls } = await adminClient
    .from('analytics_events')
    .select('*', { count: 'exact', head: true })
    .eq('event_type', 'pwa_install');

  return {
    totalUsers,
    newUsersToday,
    dau: uniqueDau.size,
    wau: uniqueWau.size,
    mau: uniqueMau.size,
    totalAnalyses,
    analysesToday,
    pwaInstalls: pwaInstalls || 0,
    recentUsers: allUsers?.users.slice(0, 5) || [],
    recentAnalyses: analyses?.slice(0, 5) || []
  };
}

export default async function AdminDashboard() {
  const data = await getAdminData();

  return (
    <>
      <header className="bg-background border-b border-border p-4 px-6 flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2 text-primary">
          <Settings className="w-5 h-5" />
          LearnLens Admin Analytics
        </h2>
        <Link href="/student/dashboard">
          <Button variant="ghost" size="sm" className="gap-2">
            <LogOut className="w-4 h-4" /> Exit to App
          </Button>
        </Link>
      </header>

      <main className="max-w-7xl mx-auto p-6 md:p-10 space-y-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" /> Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{data.totalUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">+{data.newUsersToday} today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Activity className="w-4 h-4" /> Active Users (MAU)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{data.mau}</div>
              <p className="text-xs text-muted-foreground mt-1">DAU: {data.dau} | WAU: {data.wau}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <FileText className="w-4 h-4" /> Total Analyses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{data.totalAnalyses}</div>
              <p className="text-xs text-muted-foreground mt-1">+{data.analysesToday} today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Smartphone className="w-4 h-4" /> Recorded PWA Installs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{data.pwaInstalls}</div>
              <p className="text-xs text-muted-foreground mt-1">Browser tracked events</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.recentUsers.map(user => (
                  <div key={user.id} className="flex justify-between items-center text-sm border-b pb-2 last:border-0">
                    <div>
                      <p className="font-medium">{user.email}</p>
                      <p className="text-xs text-muted-foreground">Joined: {new Date(user.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${user.email_confirmed_at ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {user.email_confirmed_at ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Analyses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.recentAnalyses.map(analysis => (
                  <div key={analysis.id} className="flex justify-between items-center text-sm border-b pb-2 last:border-0">
                    <div>
                      <p className="font-medium">{analysis.subject_detected}</p>
                      <p className="text-xs text-muted-foreground">{new Date(analysis.created_at).toLocaleString()}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${analysis.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {analysis.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}

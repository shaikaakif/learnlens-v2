import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AmbientAuroraBackground } from '@/components/ui/ambient-aurora-background';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const demoAuth = cookieStore.get('demo_auth');

  // Check if they have the demo authentication cookie
  if (!demoAuth || demoAuth.value !== 'authenticated') {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-muted/20 relative overflow-hidden">
      {/* Living Aurora Ambient Background */}
      <AmbientAuroraBackground variant="subtle" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

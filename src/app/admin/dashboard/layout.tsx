import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

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
    <div className="min-h-screen bg-muted/30">
      {children}
    </div>
  );
}

import { db } from '@/lib/db';
import ProfileClientPage from './client-page';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/student/login');
  }

  const profileData = await db.getProfile();
  
  return <ProfileClientPage profileData={profileData} />;
}

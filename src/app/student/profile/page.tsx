import { db } from '@/lib/db';
import { DEMO_STUDENT_ID } from '@/lib/constants';
import ProfileClientPage from './client-page';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const profileData = await db.getProfile(DEMO_STUDENT_ID);
  
  return <ProfileClientPage profileData={profileData} />;
}

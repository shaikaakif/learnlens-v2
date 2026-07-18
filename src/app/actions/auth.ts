"use server";

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginWithDemoPassword(state: any, formData: FormData) {
  const password = formData.get('password') as string;
  const portalType = formData.get('portalType') as 'teacher' | 'admin';

  if (!password) {
    return { error: 'Password is required' };
  }

  const expectedPassword = process.env.DEMO_PORTAL_PASSWORD;

  if (!expectedPassword || password !== expectedPassword) {
    return { error: 'Invalid demo password' };
  }

  // Create a demo session cookie
  const cookieStore = await cookies();
  cookieStore.set('demo_auth', 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 // 24 hours
  });

  // Redirect to respective dashboard
  redirect(`/${portalType}/dashboard`);
}

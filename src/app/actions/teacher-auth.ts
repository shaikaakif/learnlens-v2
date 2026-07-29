'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export interface TeacherOnboardingInput {
  fullName: string;
  schoolName: string;
  primarySubject: string;
  classesTaught: string[];
  passcode: string;
}

export interface TeacherAuthResult {
  error?: string;
  success?: boolean;
  message?: string;
}

export async function teacherLogin(_prevState: any, formData: FormData): Promise<TeacherAuthResult> {
  const email = (formData.get('email') as string || '').trim();
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Please enter both email and password.' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      return { error: 'Invalid email or password. Please try again.' };
    }
    if (error.message.includes('Email not confirmed')) {
      return { error: 'Please confirm your email address before signing in.' };
    }
    return { error: error.message || 'Authentication failed.' };
  }

  if (!data.user) {
    return { error: 'User session could not be established.' };
  }

  // Check if teacher profile exists
  const { data: teacherProfile } = await supabase
    .from('teacher_profiles')
    .select('id')
    .eq('user_id', data.user.id)
    .maybeSingle();

  if (teacherProfile) {
    redirect('/teacher/dashboard');
  } else {
    redirect('/teacher/onboarding');
  }
}

export async function teacherSignup(_prevState: any, formData: FormData): Promise<TeacherAuthResult> {
  const email = (formData.get('email') as string || '').trim();
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Please provide both an email and a password.' };
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters long.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: 'An account with this email already exists. Please sign in instead.' };
    }
    return { error: error.message || 'Registration failed.' };
  }

  return {
    success: true,
    message: 'Account created! Please check your email inbox to verify your account, then sign in.'
  };
}

export async function teacherLogout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/teacher/login');
}

export async function completeTeacherOnboarding(input: TeacherOnboardingInput) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: 'User is not authenticated. Please sign in.' };
  }

  if (!input.fullName || !input.schoolName || !input.primarySubject || !input.classesTaught || input.classesTaught.length === 0 || !input.passcode) {
    return { error: 'Please complete all onboarding fields including passcode.' };
  }

  // Verify school admin passcode against env local (learnlens@2026)
  const expectedPasscode = process.env.DEMO_PORTAL_PASSWORD || 'learnlens@2026';
  if (input.passcode.trim() !== expectedPasscode) {
    return { error: 'Invalid school admin passcode. Please check the passcode and try again.' };
  }

  try {
    // 1. Resolve or create school record
    let schoolId: string | null = null;
    const { data: existingSchool } = await supabase
      .from('schools')
      .select('id')
      .ilike('name', input.schoolName.trim())
      .maybeSingle();

    if (existingSchool) {
      schoolId = existingSchool.id;
    } else {
      const { data: newSchool, error: schoolErr } = await supabase
        .from('schools')
        .insert({ name: input.schoolName.trim() })
        .select('id')
        .single();
      
      if (!schoolErr && newSchool) {
        schoolId = newSchool.id;
      }
    }

    // 2. Upsert teacher profile (omitting updated_at to match database schema)
    const { data: profile, error: profileErr } = await supabase
      .from('teacher_profiles')
      .upsert(
        {
          user_id: user.id,
          school_id: schoolId,
          full_name: input.fullName.trim(),
          primary_subject: input.primarySubject.trim(),
        },
        { onConflict: 'user_id' }
      )
      .select('id')
      .single();

    if (profileErr || !profile) {
      console.error('Error creating teacher profile:', profileErr);
      return { error: 'Failed to save teacher profile. Please try again.' };
    }

    // 3. Clear and insert teacher classes
    await supabase.from('teacher_classes').delete().eq('teacher_id', profile.id);

    const classRows = input.classesTaught.map((cls) => ({
      teacher_id: profile.id,
      class_level: cls,
      section: 'A',
    }));

    const { error: classErr } = await supabase.from('teacher_classes').insert(classRows);
    if (classErr) {
      console.error('Error adding teacher classes:', classErr);
    }

    revalidatePath('/teacher/dashboard');
    return { success: true };
  } catch (err: any) {
    console.error('Onboarding exception:', err);
    return { error: 'An unexpected error occurred while saving your profile.' };
  }
}

export async function getTeacherProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('teacher_profiles')
    .select('*, schools(name), teacher_classes(class_level, section)')
    .eq('user_id', user.id)
    .maybeSingle();

  return profile;
}

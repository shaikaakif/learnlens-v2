'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface UpdateProfileInput {
  fullName: string;
  schoolName: string;
  primarySubject: string;
  classesTaught: string[];
}

export async function updateTeacherProfile(input: UpdateProfileInput) {
  const supabase = await createClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();

  if (authErr || !user) {
    return { error: 'Unauthorized. Please sign in.' };
  }

  if (!input.fullName || !input.schoolName || !input.primarySubject || !input.classesTaught || input.classesTaught.length === 0) {
    return { error: 'All profile fields are required.' };
  }

  try {
    // 1. Resolve or create school
    let schoolId: string | null = null;
    const { data: existingSchool } = await supabase
      .from('schools')
      .select('id')
      .ilike('name', input.schoolName.trim())
      .maybeSingle();

    if (existingSchool) {
      schoolId = existingSchool.id;
    } else {
      const { data: newSchool } = await supabase
        .from('schools')
        .insert({ name: input.schoolName.trim() })
        .select('id')
        .single();
      if (newSchool) {
        schoolId = newSchool.id;
      }
    }

    // 2. Update profile
    const { data: profile, error: profileErr } = await supabase
      .from('teacher_profiles')
      .update({
        full_name: input.fullName.trim(),
        school_id: schoolId,
        primary_subject: input.primarySubject.trim(),
      })
      .eq('user_id', user.id)
      .select('id')
      .single();

    if (profileErr || !profile) {
      console.error('Error updating profile:', profileErr);
      return { error: 'Failed to update profile. Please try again.' };
    }

    // 3. Update classes
    await supabase.from('teacher_classes').delete().eq('teacher_id', profile.id);

    const classRows = input.classesTaught.map((cls) => ({
      teacher_id: profile.id,
      class_level: cls,
      section: 'A',
    }));

    await supabase.from('teacher_classes').insert(classRows);

    revalidatePath('/teacher/profile');
    revalidatePath('/teacher/dashboard');
    return { success: true };
  } catch (err: any) {
    console.error('Update profile exception:', err);
    return { error: 'An unexpected error occurred.' };
  }
}

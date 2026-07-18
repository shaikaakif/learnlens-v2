"use server";

import { db } from '@/lib/db';
import { Student } from '@/types';
import { revalidatePath } from 'next/cache';

export async function saveStudentProfile(profile: Student) {
  try {
    await db.saveProfile(profile);
    revalidatePath('/student/profile');
    revalidatePath('/student/dashboard');
    return { success: true };
  } catch (error: any) {
    console.error('Error saving profile:', error);
    return { success: false, error: error.message };
  }
}

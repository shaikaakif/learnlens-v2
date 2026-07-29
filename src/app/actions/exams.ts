'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { parseQuestionPaper } from '@/services/ai/exam-paper-parser';

export interface CreateExamInput {
  title: string;
  subject: string;
  classLevel: string;
  section?: string;
  totalMarks?: number;
}

export async function createExamAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();

  if (authErr || !user) {
    return { error: 'Unauthorized. Please sign in.' };
  }

  const title = (formData.get('title') as string || '').trim();
  const subject = (formData.get('subject') as string || '').trim();
  const classLevel = (formData.get('classLevel') as string || '').trim();
  const section = (formData.get('section') as string || 'A').trim();
  const paperFile = formData.get('paperFile') as File | null;
  const blueprintFile = formData.get('blueprintFile') as File | null;

  if (!title || !subject || !classLevel) {
    return { error: 'Exam Title, Subject, and Class Level are required.' };
  }

  try {
    let questionPaperPath: string | null = null;
    let blueprintPath: string | null = null;
    let fileBufferData: string | null = null;
    let fileMimeType: string = 'application/pdf';

    // Process & Upload Question Paper File
    if (paperFile && paperFile.size > 0) {
      fileMimeType = paperFile.type || 'application/pdf';
      const arrayBuffer = await paperFile.arrayBuffer();
      fileBufferData = Buffer.from(arrayBuffer).toString('base64');

      const fileExt = paperFile.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}_paper.${fileExt}`;

      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('question-papers')
        .upload(filePath, paperFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (!uploadErr && uploadData) {
        questionPaperPath = uploadData.path;
      } else {
        questionPaperPath = `stored-ref/${paperFile.name}`;
      }
    }

    // Upload Blueprint File to Storage if provided
    if (blueprintFile && blueprintFile.size > 0) {
      const fileExt = blueprintFile.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}_blueprint.${fileExt}`;

      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('question-papers')
        .upload(filePath, blueprintFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (!uploadErr && uploadData) {
        blueprintPath = uploadData.path;
      } else {
        blueprintPath = `stored-ref/${blueprintFile.name}`;
      }
    }

    // Get school_id from teacher_profile
    const { data: teacherProfile } = await supabase
      .from('teacher_profiles')
      .select('school_id')
      .eq('user_id', user.id)
      .maybeSingle();

    // Insert new Exam record with DRAFT status
    const { data: exam, error: examErr } = await supabase
      .from('exams')
      .insert({
        teacher_id: user.id,
        school_id: teacherProfile?.school_id || null,
        title,
        subject,
        class_level: classLevel,
        section,
        question_paper_path: questionPaperPath,
        blueprint_path: blueprintPath,
        status: 'DRAFT',
        parsed_paper_json: paperFile ? { 
          fileName: paperFile.name, 
          fileSize: paperFile.size,
          mimeType: fileMimeType,
          base64Data: fileBufferData 
        } : {},
        parsed_blueprint_json: blueprintFile ? { fileName: blueprintFile.name } : {}
      })
      .select('id')
      .single();

    if (examErr || !exam) {
      console.error('Error creating exam:', examErr);
      return { error: 'Failed to create examination record. Please try again.' };
    }

    revalidatePath('/teacher/dashboard');
    return { success: true, examId: exam.id };
  } catch (err: any) {
    console.error('Create exam exception:', err);
    return { error: 'An unexpected error occurred while saving the examination.' };
  }
}

export async function getTeacherExams() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: exams, error } = await supabase
    .from('exams')
    .select('*')
    .eq('teacher_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching teacher exams:', error);
    return [];
  }

  return exams || [];
}

export async function getExamDetails(examId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: exam } = await supabase
    .from('exams')
    .select('*, exam_questions(*)')
    .eq('id', examId)
    .eq('teacher_id', user.id)
    .maybeSingle();

  return exam;
}

export async function parseExamAction(examId: string) {
  const supabase = await createClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();

  if (authErr || !user) {
    return { error: 'Unauthorized' };
  }

  // 1. Fetch exam details
  const { data: exam } = await supabase
    .from('exams')
    .select('*')
    .eq('id', examId)
    .eq('teacher_id', user.id)
    .maybeSingle();

  if (!exam) {
    return { error: 'Examination not found or access denied.' };
  }

  try {
    let base64Data: string | undefined = exam.parsed_paper_json?.base64Data;
    let mimeType: string = exam.parsed_paper_json?.mimeType || 'application/pdf';

    // Download from Supabase Storage if base64 isn't stored locally in json
    if (!base64Data && exam.question_paper_path && !exam.question_paper_path.startsWith('stored-ref/')) {
      const { data: fileBlob, error: downloadErr } = await supabase.storage
        .from('question-papers')
        .download(exam.question_paper_path);

      if (!downloadErr && fileBlob) {
        const buffer = await fileBlob.arrayBuffer();
        base64Data = Buffer.from(buffer).toString('base64');
        mimeType = fileBlob.type || mimeType;
      }
    }

    // Call Gemini Parser Service
    const parsedResult = await parseQuestionPaper({
      base64Data,
      mimeType,
      examTitle: exam.title,
      subject: exam.subject,
      classLevel: exam.class_level,
    });

    // Save parsed result into exams table (status remains DRAFT for teacher review)
    const updatedPayload = {
      ...(exam.parsed_paper_json || {}),
      parsedData: parsedResult,
      parsedAt: new Date().toISOString(),
    };

    const { error: updateErr } = await supabase
      .from('exams')
      .update({ parsed_paper_json: updatedPayload })
      .eq('id', examId);

    if (updateErr) {
      console.error('Error saving parsed JSON:', updateErr);
      return { error: 'Failed to persist parsed examination questions.' };
    }

    revalidatePath(`/teacher/exams/${examId}`);
    return { success: true, parsedPaper: parsedResult };
  } catch (err: any) {
    console.error('Parse exam action error:', err);
    return { error: err.message || 'AI Parsing failed. Please retry.' };
  }
}

export async function saveExamDraftAction(examId: string, questions: any[], totalMarks?: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const { data: exam } = await supabase
    .from('exams')
    .select('parsed_paper_json')
    .eq('id', examId)
    .eq('teacher_id', user.id)
    .maybeSingle();

  if (!exam) return { error: 'Exam not found' };

  const currentPayload = exam.parsed_paper_json || {};
  const currentParsed = currentPayload.parsedData || {};

  const updatedParsedData = {
    ...currentParsed,
    totalMarks: totalMarks || questions.reduce((s: number, q: any) => s + (Number(q.maxMarks) || 0), 0),
    questions: questions.map((q) => ({
      questionNumber: q.questionNumber || 'Q1',
      section: q.section || 'Section A',
      questionText: q.questionText || '',
      maxMarks: Number(q.maxMarks) || 1,
      conceptTopic: q.conceptTopic || 'General Concept',
      type: q.type || 'Descriptive',
    })),
  };

  const { error } = await supabase
    .from('exams')
    .update({
      parsed_paper_json: {
        ...currentPayload,
        parsedData: updatedParsedData,
      },
    })
    .eq('id', examId);

  if (error) {
    return { error: 'Failed to update draft.' };
  }

  revalidatePath(`/teacher/exams/${examId}`);
  return { success: true };
}

export async function publishExamAction(examId: string, questions: any[], totalMarks?: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  if (!questions || questions.length === 0) {
    return { error: 'Cannot publish an examination with zero questions.' };
  }

  try {
    // 1. Delete previous questions for this exam if any
    await supabase.from('exam_questions').delete().eq('exam_id', examId);

    // 2. Insert reviewed questions into exam_questions table
    const questionRows = questions.map((q, idx) => ({
      exam_id: examId,
      question_number: q.questionNumber || `Q${idx + 1}`,
      section: q.section || 'Section A',
      question_text: q.questionText || `Question ${idx + 1}`,
      max_marks: Number(q.maxMarks) || 1,
      concept_topic: q.conceptTopic || 'General Concept',
    }));

    const { error: insertErr } = await supabase.from('exam_questions').insert(questionRows);

    if (insertErr) {
      console.error('Error inserting published questions:', insertErr);
      return { error: 'Failed to publish examination questions.' };
    }

    // 3. Update exam status to PUBLISHED
    const { error: updateErr } = await supabase
      .from('exams')
      .update({
        status: 'PUBLISHED',
        published_at: new Date().toISOString(),
      })
      .eq('id', examId)
      .eq('teacher_id', user.id);

    if (updateErr) {
      return { error: 'Failed to update examination status to PUBLISHED.' };
    }

    revalidatePath('/teacher/dashboard');
    revalidatePath(`/teacher/exams/${examId}`);
    return { success: true };
  } catch (err: any) {
    console.error('Publish exam error:', err);
    return { error: 'An unexpected error occurred while publishing.' };
  }
}

export async function deleteExamAction(examId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const { error } = await supabase
    .from('exams')
    .delete()
    .eq('id', examId)
    .eq('teacher_id', user.id);

  if (error) {
    return { error: 'Failed to delete examination.' };
  }

  revalidatePath('/teacher/dashboard');
  return { success: true };
}

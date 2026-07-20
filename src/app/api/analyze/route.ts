import { NextRequest, NextResponse } from 'next/server';
import { AnalysisPipelineRouter } from '@/services/analysis/analysis-pipeline-router';
import { createClient } from '@/lib/supabase/server';
import { logServerEvent } from '@/lib/analytics/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const assessmentId = formData.get('assessmentId') as string;
    
    // Securely derive identity from session
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const studentId = user.id;

    if (!assessmentId) {
      return NextResponse.json({ error: 'Missing assessmentId' }, { status: 400 });
    }

    const files = formData.getAll('files') as File[];
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    // Initialize the provider
    let provider: AnalysisPipelineRouter;
    try {
      provider = new AnalysisPipelineRouter();
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }

    // Perform analysis
    const startTime = Date.now();
    const { db } = await import('@/lib/db');
    const profile = await db.getProfile(studentId);
    
    logServerEvent({
      userId: studentId,
      eventType: 'analysis_started',
      metadata: { assessmentId, fileCount: files.length }
    });
    
    const mri = await provider.analyzeAssessment({
      assessmentId,
      studentId,
      files,
      profileContext: profile
    });
    const duration = Date.now() - startTime;

    // Save to Supabase persistent store
    await db.saveAnalysis(mri, {
      model_used: 'gemini-2.5-flash',
      processing_duration_ms: duration
    });

    logServerEvent({
      userId: studentId,
      eventType: 'analysis_completed',
      metadata: { assessmentId, duration, subject: mri.subjectDetected }
    });

    return NextResponse.json({ success: true, analysisId: mri.id });
  } catch (error: any) {
    console.error('API /analyze error:', error);
    
    // We attempt to extract studentId if it failed after auth, but it might be undefined
    const userId = (await createClient().then(c => c.auth.getUser()).then(res => res.data?.user?.id).catch(() => null)) || undefined;
    logServerEvent({
      userId: userId,
      eventType: 'analysis_failed',
      metadata: { error: error.message || 'Unknown error' }
    });
    
    if (error.name === 'AIFailureError') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: error.code,
            message: error.message || 'The AI analysis was generated but could not be structured correctly.',
            requestId: `req-${Date.now()}`
          }
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'UNKNOWN_ANALYSIS_ERROR',
          message: error.message || 'An unexpected error occurred during analysis.',
          requestId: `req-${Date.now()}`
        }
      }, 
      { status: 500 }
    );
  }
}

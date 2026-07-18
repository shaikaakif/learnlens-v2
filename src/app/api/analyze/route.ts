import { NextRequest, NextResponse } from 'next/server';
import { GeminiAnalysisProvider } from '@/services/analysis/gemini-analysis-provider';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const assessmentId = formData.get('assessmentId') as string;
    const studentId = formData.get('studentId') as string;
    
    if (!assessmentId || !studentId) {
      return NextResponse.json({ error: 'Missing assessmentId or studentId' }, { status: 400 });
    }

    const files = formData.getAll('files') as File[];
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    // Initialize the provider
    let provider: GeminiAnalysisProvider;
    try {
      provider = new GeminiAnalysisProvider();
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }

    // Perform analysis
    const startTime = Date.now();
    const { db } = await import('@/lib/db');
    const profile = await db.getProfile(studentId);
    
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

    return NextResponse.json({ success: true, analysisId: mri.id });
  } catch (error: any) {
    console.error('API /analyze error:', error);
    
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

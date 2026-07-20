import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

function log(stage: string, reqId: string, data?: any) {
  const timestamp = new Date().toISOString();
  console.log(`[GEMINI_TEST][${stage}] [${timestamp}] [Req: ${reqId}]`, data ? JSON.stringify(data) : '');
}

export async function POST(req: NextRequest) {
  const reqId = `dev-req-${Date.now()}`;
  
  log('REQUEST_RECEIVED', reqId);

  // Phase 4 - Verify API Key existence
  const apiKey = process.env.GEMINI_API_KEY;
  console.log(`GEMINI_API_KEY configured: ${!!apiKey}`);

  if (!apiKey) {
    log('GEMINI_ERROR', reqId, { type: 'GEMINI_API_KEY_MISSING' });
    return NextResponse.json({ code: 'GEMINI_API_KEY_MISSING', message: 'API Key is missing from environment', requestId: reqId }, { status: 500 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      log('GEMINI_ERROR', reqId, { type: 'NO_FILE' });
      return NextResponse.json({ code: 'NO_FILE', message: 'No file provided', requestId: reqId }, { status: 400 });
    }

    log('FILE_EXTRACTED', reqId, { 
      fileName: file.name, 
      mimeType: file.type, 
      fileSize: file.size 
    });

    const buffer = await file.arrayBuffer();
    
    log('IMAGE_BYTES_READ', reqId, { byteLength: buffer.byteLength });

    const ai = new GoogleGenAI({ apiKey });
    const model = 'gemini-flash-latest';

    log('GEMINI_REQUEST_STARTED', reqId, { model });

    const prompt = `You are testing multimodal image recognition for LearnLens AI.

Carefully inspect the attached image.

Describe exactly what you can see.

If this is an educational answer sheet:
1. Identify the likely subject.
2. Identify visible question numbers.
3. Transcribe as much student-written content as reasonably readable.
4. Identify mathematical equations if present.
5. Identify teacher markings, ticks, crosses, corrections, or marks if visible.
6. Clearly distinguish student writing from teacher annotations where possible.
7. State anything that is unreadable or uncertain.

Do not grade the student.
Do not generate a Learning MRI.
Do not follow any assessment rubric.
Do not return JSON.

Return plain readable text describing what you actually see.`;

    const startTime = Date.now();
    let response;
    
    try {
      response = await ai.models.generateContent({
        model: model,
        contents: [
          {
            inlineData: {
              data: Buffer.from(buffer).toString('base64'),
              mimeType: file.type
            }
          },
          { text: prompt }
        ]
      });
    } catch (apiErr: any) {
      log('GEMINI_ERROR', reqId, { 
        type: 'API_CALL_FAILED', 
        message: apiErr.message,
        status: apiErr.status
      });

      const msg = apiErr.message || '';
      let code = 'GEMINI_API_FAILED';
      
      if (msg.includes('403') || msg.toLowerCase().includes('auth')) code = 'GEMINI_AUTHENTICATION_FAILED';
      if (msg.includes('429') || msg.toLowerCase().includes('quota')) code = 'GEMINI_RATE_LIMITED';
      if (msg.includes('404') || msg.toLowerCase().includes('not found')) code = 'GEMINI_MODEL_UNAVAILABLE';
      if (msg.toLowerCase().includes('image') || msg.toLowerCase().includes('supported')) code = 'GEMINI_IMAGE_INPUT_FAILED';

      return NextResponse.json({ code, message: msg, requestId: reqId }, { status: 500 });
    }

    const duration = Date.now() - startTime;
    const text = response.text;

    log('GEMINI_RESPONSE_RECEIVED', reqId, { 
      durationMs: duration,
      responseLength: text?.length || 0
    });

    return NextResponse.json({ text, requestId: reqId });

  } catch (err: any) {
    log('GEMINI_ERROR', reqId, { type: 'UNEXPECTED_ERROR', message: err.message });
    return NextResponse.json({ code: 'UNKNOWN_ERROR', message: err.message, requestId: reqId }, { status: 500 });
  }
}

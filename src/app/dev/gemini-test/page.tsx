"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadCloud, FileImage, BrainCircuit, AlertCircle } from 'lucide-react';

export default function GeminiTestPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>('IDLE');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<{ code: string; message: string; reqId?: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setStatus('IMAGE SELECTED');
      setResult(null);
      setError(null);
    }
  };

  const handleTest = async () => {
    if (!file) return;

    try {
      setStatus('UPLOADING TO SERVER');
      setError(null);
      setResult(null);

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/dev/gemini-test', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw {
          code: errorData?.code || 'HTTP_ERROR',
          message: errorData?.message || `Server returned status ${res.status}`,
          reqId: errorData?.requestId
        };
      }

      const data = await res.json();
      setStatus('GEMINI RESPONDED');
      setResult(data.text);
      
    } catch (err: any) {
      setStatus('FAILED');
      setError({
        code: err.code || 'UNKNOWN_ERROR',
        message: err.message || err.toString(),
        reqId: err.reqId
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Gemini Diagnostic Test Bench</h1>
        <p className="text-muted-foreground">Isolate and prove the Gemini multimodal pipeline.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Image Upload</CardTitle>
            <CardDescription>Upload a single image for raw testing.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center relative hover:bg-muted/50 transition-colors">
              <UploadCloud className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <label htmlFor="dev-file-upload" className="cursor-pointer absolute inset-0 flex items-center justify-center opacity-0 z-10">
                <input 
                  id="dev-file-upload" 
                  type="file" 
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden" 
                  onChange={handleFileChange}
                />
              </label>
              <p className="text-sm font-medium text-primary">Click to select image</p>
            </div>

            {file && (
              <div className="p-4 bg-muted rounded-lg text-sm space-y-1">
                <div className="flex items-center gap-2 font-medium mb-2">
                  <FileImage className="w-4 h-4 text-primary" />
                  File Metadata
                </div>
                <p><span className="text-muted-foreground">Name:</span> {file.name}</p>
                <p><span className="text-muted-foreground">Type:</span> {file.type}</p>
                <p><span className="text-muted-foreground">Size:</span> {(file.size / 1024).toFixed(2)} KB</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={handleTest} disabled={!file || status === 'UPLOADING TO SERVER'} className="w-full gap-2">
              <BrainCircuit className="w-4 h-4" />
              Send Directly to Gemini
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Status & Output</CardTitle>
            <CardDescription>Current State: <strong className="text-primary">{status}</strong></CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto bg-slate-950 text-green-400 font-mono text-sm p-4 rounded-b-xl max-h-[500px]">
            {error && (
              <div className="text-red-400 space-y-2">
                <div className="flex items-center gap-2 text-red-500 font-bold mb-4">
                  <AlertCircle className="w-5 h-5" /> Gemini test failed.
                </div>
                <p><strong>Code:</strong> {error.code}</p>
                <p><strong>Message:</strong> {error.message}</p>
                {error.reqId && <p><strong>Request ID:</strong> {error.reqId}</p>}
              </div>
            )}

            {result && (
              <div className="space-y-4">
                <div className="text-white font-bold mb-4 border-b border-green-800 pb-2">
                  Gemini successfully analyzed your image.
                </div>
                <div className="whitespace-pre-wrap">{result}</div>
              </div>
            )}

            {!error && !result && (
              <div className="text-slate-500 opacity-50">
                Waiting for execution...
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

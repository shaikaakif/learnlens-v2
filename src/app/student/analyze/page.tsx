"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadCloud, FileImage, AlertCircle, X, Trash2, BrainCircuit, Camera as CameraIcon, Plus } from 'lucide-react';
import { AnalysisService } from '@/services/analysis';
import { DEMO_STUDENT_ID } from '@/lib/constants';
import { AnalysisProgressExperience } from '@/components/ui/analysis-progress-experience';
import { ImageSourceSheet } from '@/components/student/image-source-sheet';
import { AnswerSheetCamera } from '@/components/student/answer-sheet-camera';

type ProcessState = 'idle' | 'uploading' | 'analyzing' | 'validating' | 'completed' | 'failed';

export default function AnalyzePage() {
  const router = useRouter();
  
  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<{file: File, url: string}[]>([]);
  const [processState, setProcessState] = useState<ProcessState>('idle');
  const [error, setError] = useState<string | null>(null);
  
  // UI State
  const [isMobile, setIsMobile] = useState(false);
  const [isSourceSheetOpen, setIsSourceSheetOpen] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Capability detection
  useEffect(() => {
    // Basic progressive enhancement check for coarse pointers / touch devices
    const checkMobile = () => {
      const hasTouch = (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0) || 
                       (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches);
      setIsMobile(hasTouch);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Update object URLs when files change
  useEffect(() => {
    const newPreviews = files.map(file => ({
      file,
      url: URL.createObjectURL(file)
    }));
    setFilePreviews(newPreviews);
    
    // Cleanup URLs on unmount or change
    return () => {
      newPreviews.forEach(p => URL.revokeObjectURL(p.url));
    };
  }, [files]);

  const handleFilesAdded = (newFiles: File[]) => {
    if (newFiles.length > 0) {
      setFiles(prev => [...prev, ...newFiles]);
      setError(null);
      setIsSourceSheetOpen(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesAdded(Array.from(e.target.files));
    }
  };

  const handleCameraCapture = (file: File) => {
    handleFilesAdded([file]);
    setIsCameraActive(false);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const triggerDesktopUpload = () => {
    fileInputRef.current?.click();
  };

  const handleUploadAndAnalyze = async () => {
    if (files.length === 0) {
      setError("Please select at least one image to analyze.");
      return;
    }

    setProcessState('uploading');
    setError(null);
    
    try {
      const analysisService = new AnalysisService();

      setProcessState('uploading');
      setTimeout(() => setProcessState('analyzing'), 1500);

      const analysisId = await analysisService.analyzeAssessment(DEMO_STUDENT_ID, files);

      setProcessState('validating');
      await new Promise(r => setTimeout(r, 800));

      setProcessState('completed');
      await new Promise(r => setTimeout(r, 1200)); 

      router.push(`/student/learning-mri/${analysisId}`);
      
    } catch (err: any) {
      setProcessState('failed');
      console.error(err);
      if (err.message && err.message.includes('AIFailureError')) {
         setError("We encountered an issue while generating the Learning MRI. Please ensure the image is clear and try again.");
      } else {
         setError(err.message || "An unexpected error occurred during analysis.");
      }
    }
  };

  if (processState !== 'idle' && processState !== 'failed') {
    return <AnalysisProgressExperience state={processState} onRetry={() => {}} onCancel={() => {}} />;
  }

  // If Fullscreen Camera is active
  if (isCameraActive) {
    return (
      <AnswerSheetCamera 
        onCapture={handleCameraCapture}
        onClose={() => setIsCameraActive(false)}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12 animate-in fade-in duration-700 slide-in-from-bottom-8">
      
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-serif">Analyze Answer Sheet</h1>
        <p className="text-muted-foreground text-lg">Upload clear photos of your answer sheet for automatic subject detection and analysis.</p>
      </div>

      <Card className="border-border/60 shadow-xl bg-card">
        <CardContent className="pt-6 space-y-8">
          
          {/* Main Acquisition Area (If no files selected yet, or always visible on desktop) */}
          {files.length === 0 && (
            isMobile ? (
              <Button 
                size="lg"
                className="w-full h-32 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 flex flex-col gap-3 text-primary"
                onClick={() => setIsSourceSheetOpen(true)}
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <CameraIcon className="w-6 h-6" />
                </div>
                <span className="text-lg font-semibold tracking-wide">Add Answer Sheets</span>
              </Button>
            ) : (
              <div 
                className="border-2 border-dashed border-primary/20 rounded-2xl p-10 text-center hover:bg-primary/5 hover:border-primary/40 transition-colors group cursor-pointer relative"
                onClick={triggerDesktopUpload}
              >
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  className="hidden"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  title="Upload answer sheets"
                />
                
                <div className="space-y-4 relative z-0">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-foreground">Click or drag images here</p>
                    <p className="text-sm text-muted-foreground mt-1">Supports JPG, PNG, WebP</p>
                  </div>
                </div>
              </div>
            )
          )}

          {/* Upload Queue (Files Selected) */}
          {files.length > 0 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-foreground tracking-wide uppercase text-sm">Selected Pages ({files.length})</h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-full h-8 px-3 gap-1.5 border-primary/20 text-primary hover:bg-primary/10"
                  onClick={() => isMobile ? setIsSourceSheetOpen(true) : triggerDesktopUpload()}
                >
                  <Plus className="w-4 h-4" /> Add Page
                </Button>
              </div>
              
              <div className="grid gap-3 sm:grid-cols-2">
                {filePreviews.map((preview, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border border-border/60 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-12 h-12 rounded-lg bg-black/5 flex items-center justify-center shrink-0 overflow-hidden relative">
                        <img src={preview.url} alt={`Page ${i+1}`} className="w-full h-full object-cover" />
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-semibold truncate text-foreground/90">Page {i + 1}</p>
                        <p className="text-xs text-muted-foreground">{(preview.file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeFile(i)}
                      className="opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-destructive hover:bg-destructive/10 rounded-full w-8 h-8"
                      aria-label={`Remove Page ${i + 1}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm flex items-start gap-3 border border-destructive/20 animate-in fade-in zoom-in-95">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="space-y-1 w-full">
                <p className="font-semibold">We encountered an issue.</p>
                <p className="opacity-90 leading-relaxed">{error}</p>
              </div>
              <Button variant="ghost" size="icon" className="shrink-0 -mt-1 -mr-1 h-8 w-8 text-destructive hover:bg-destructive/20 rounded-full" onClick={() => setError(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="bg-muted/30 border-t border-border/40 p-6 pt-5">
          <Button 
            className="w-full text-lg h-14 font-semibold tracking-wide rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-[0.98]" 
            size="lg" 
            onClick={handleUploadAndAnalyze}
            disabled={files.length === 0}
          >
            <BrainCircuit className="w-5 h-5 mr-2" />
            Analyze My Answer Sheet
          </Button>
        </CardFooter>
      </Card>

      {/* Hidden fallback file input for desktop "Add Page" button */}
      <input 
        type="file" 
        multiple 
        accept="image/*" 
        className="hidden"
        onChange={handleFileChange}
        ref={fileInputRef}
        title="Upload answer sheets"
      />

      {/* Mobile Bottom Sheet */}
      <ImageSourceSheet 
        isOpen={isSourceSheetOpen}
        onClose={() => setIsSourceSheetOpen(false)}
        onSelectCamera={() => {
          setIsSourceSheetOpen(false);
          setIsCameraActive(true);
        }}
        onSelectFiles={handleFilesAdded}
      />
      
    </div>
  );
}

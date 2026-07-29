'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  FileText, Upload, CheckCircle2, ArrowLeft, ArrowRight, 
  Loader2, Sparkles, Layers, BookOpen, FileCheck, AlertCircle, X
} from 'lucide-react';
import { AmbientAuroraBackground } from '@/components/ui/ambient-aurora-background';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createExamAction } from '@/app/actions/exams';
import { triggerHaptic } from '@/lib/haptics';

const CLASS_OPTIONS = [
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'
];

const SUBJECT_OPTIONS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Computer Science', 'Social Studies', 'Hindi'
];

export default function CreateExamPage() {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [classLevel, setClassLevel] = useState('');
  const [section, setSection] = useState('A');
  const [subject, setSubject] = useState('Mathematics');
  const [paperFile, setPaperFile] = useState<File | null>(null);
  const [blueprintFile, setBlueprintFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleNext = () => {
    setErrorMsg(null);
    if (step === 1 && !title.trim()) {
      setErrorMsg('Please enter an examination title.');
      return;
    }
    if (step === 2 && !classLevel) {
      setErrorMsg('Please select a class grade level.');
      return;
    }
    if (step === 3 && !section.trim()) {
      setErrorMsg('Please specify a section.');
      return;
    }
    if (step === 4 && !subject) {
      setErrorMsg('Please select a subject.');
      return;
    }

    triggerHaptic('medium');
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (step > 1) {
      triggerHaptic('light');
      setErrorMsg(null);
      setStep((prev) => prev - 1);
    }
  };

  const handlePaperFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 15 * 1024 * 1024) {
        setErrorMsg('File size must be under 15MB.');
        return;
      }
      triggerHaptic('light');
      setErrorMsg(null);
      setPaperFile(file);
    }
  };

  const handleBlueprintFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 15 * 1024 * 1024) {
        setErrorMsg('File size must be under 15MB.');
        return;
      }
      triggerHaptic('light');
      setErrorMsg(null);
      setBlueprintFile(file);
    }
  };

  const handleSubmit = async () => {
    triggerHaptic('medium');
    setIsSubmitting(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('classLevel', classLevel);
    formData.append('section', section);
    formData.append('subject', subject);
    if (paperFile) formData.append('paperFile', paperFile);
    if (blueprintFile) formData.append('blueprintFile', blueprintFile);

    const result = await createExamAction(formData);

    setIsSubmitting(false);

    if (result?.error) {
      setErrorMsg(result.error);
    } else {
      triggerHaptic('success');
      setStep(8);
      setTimeout(() => {
        window.location.href = '/teacher/dashboard';
      }, 1200);
    }
  };

  const TOTAL_STEPS = 7;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-foreground relative overflow-hidden font-sans selection:bg-primary/20">
      <AmbientAuroraBackground variant="auth" />

      {/* Header */}
      <header className="p-4 md:p-6 relative z-20 max-w-4xl mx-auto w-full flex items-center justify-between">
        <Link
          href="/teacher/dashboard"
          onClick={() => triggerHaptic('light')}
          className="inline-flex items-center gap-2 text-xs md:text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors bg-white/90 border border-border/80 px-4 py-2 rounded-full backdrop-blur-xl shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Cancel
        </Link>
        
        {step <= TOTAL_STEPS && (
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5, 6, 7].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all duration-300 ${
                  s === step
                    ? 'w-6 bg-primary'
                    : s < step
                    ? 'w-2 bg-primary/50'
                    : 'w-2 bg-muted/60'
                }`}
              />
            ))}
          </div>
        )}
      </header>

      {/* Main Card Container */}
      <main className="flex-1 flex items-center justify-center p-4 relative z-10 w-full max-w-xl mx-auto">
        <Card className="w-full shadow-2xl shadow-primary/5 border-primary/25 bg-white/95 backdrop-blur-2xl rounded-3xl overflow-hidden min-h-[440px] flex flex-col justify-between">
          
          {/* STEP 1: Exam Title */}
          {step === 1 && (
            <div className="p-6 md:p-8 space-y-6 flex-1 flex flex-col justify-between animate-in fade-in zoom-in-95">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-primary/15 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs uppercase font-bold font-mono tracking-widest text-primary">Step 1 of {TOTAL_STEPS}</span>
                  <CardTitle className="text-2xl md:text-3xl font-serif font-bold text-foreground mt-1">Examination Title</CardTitle>
                  <CardDescription className="text-muted-foreground text-sm">Enter a clear descriptive title for this assessment.</CardDescription>
                </div>

                {errorMsg && (
                  <p className="text-xs text-destructive bg-destructive/10 p-3.5 rounded-xl border border-destructive/20">{errorMsg}</p>
                )}

                <div className="pt-2">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Mid-Term Physics Assessment 2026"
                    autoFocus
                    className="flex h-12 w-full rounded-xl border border-border/80 bg-background/60 px-4 py-2 text-base aurora-input focus-visible:outline-none placeholder:text-muted-foreground/60 transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 font-medium"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button onClick={handleNext} className="h-12 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow-md shadow-primary/20 flex items-center gap-2">
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Class Level */}
          {step === 2 && (
            <div className="p-6 md:p-8 space-y-6 flex-1 flex flex-col justify-between animate-in fade-in zoom-in-95">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-primary/15 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs uppercase font-bold font-mono tracking-widest text-primary">Step 2 of {TOTAL_STEPS}</span>
                  <CardTitle className="text-2xl md:text-3xl font-serif font-bold text-foreground mt-1">Select Target Class</CardTitle>
                  <CardDescription className="text-muted-foreground text-sm">Which grade level is this examination designed for?</CardDescription>
                </div>

                {errorMsg && (
                  <p className="text-xs text-destructive bg-destructive/10 p-3.5 rounded-xl border border-destructive/20">{errorMsg}</p>
                )}

                <div className="flex flex-wrap gap-2.5 pt-2">
                  {CLASS_OPTIONS.map((cls) => {
                    const isSelected = classLevel === cls;
                    return (
                      <button
                        key={cls}
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          setClassLevel(cls);
                        }}
                        className={`px-4 py-2.5 rounded-full text-sm font-medium border transition-all ${
                          isSelected
                            ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20 scale-105'
                            : 'bg-background/60 border-border/80 text-muted-foreground hover:border-primary/50 hover:text-foreground'
                        }`}
                      >
                        {cls}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <Button variant="ghost" onClick={handleBack} className="h-12 px-4 rounded-xl text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button onClick={handleNext} className="h-12 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow-md shadow-primary/20 flex items-center gap-2">
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Section */}
          {step === 3 && (
            <div className="p-6 md:p-8 space-y-6 flex-1 flex flex-col justify-between animate-in fade-in zoom-in-95">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-primary/15 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs uppercase font-bold font-mono tracking-widest text-primary">Step 3 of {TOTAL_STEPS}</span>
                  <CardTitle className="text-2xl md:text-3xl font-serif font-bold text-foreground mt-1">Section</CardTitle>
                  <CardDescription className="text-muted-foreground text-sm">Specify the class section (e.g. A, B, C, or All).</CardDescription>
                </div>

                {errorMsg && (
                  <p className="text-xs text-destructive bg-destructive/10 p-3.5 rounded-xl border border-destructive/20">{errorMsg}</p>
                )}

                <div className="pt-2">
                  <input
                    type="text"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    placeholder="e.g. A"
                    autoFocus
                    className="flex h-12 w-full rounded-xl border border-border/80 bg-background/60 px-4 py-2 text-base aurora-input focus-visible:outline-none placeholder:text-muted-foreground/60 transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 font-medium"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <Button variant="ghost" onClick={handleBack} className="h-12 px-4 rounded-xl text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button onClick={handleNext} className="h-12 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow-md shadow-primary/20 flex items-center gap-2">
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: Subject */}
          {step === 4 && (
            <div className="p-6 md:p-8 space-y-6 flex-1 flex flex-col justify-between animate-in fade-in zoom-in-95">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-primary/15 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs uppercase font-bold font-mono tracking-widest text-primary">Step 4 of {TOTAL_STEPS}</span>
                  <CardTitle className="text-2xl md:text-3xl font-serif font-bold text-foreground mt-1">Select Subject</CardTitle>
                  <CardDescription className="text-muted-foreground text-sm">Which subject area does this examination cover?</CardDescription>
                </div>

                {errorMsg && (
                  <p className="text-xs text-destructive bg-destructive/10 p-3.5 rounded-xl border border-destructive/20">{errorMsg}</p>
                )}

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  {SUBJECT_OPTIONS.map((sub) => {
                    const isSelected = subject === sub;
                    return (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          setSubject(sub);
                        }}
                        className={`p-3 rounded-xl text-left border transition-all ${
                          isSelected
                            ? 'bg-primary text-primary-foreground border-primary shadow-sm font-semibold'
                            : 'bg-background/50 border-border/80 text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <span className="text-xs md:text-sm font-medium">{sub}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <Button variant="ghost" onClick={handleBack} className="h-12 px-4 rounded-xl text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button onClick={handleNext} className="h-12 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow-md shadow-primary/20 flex items-center gap-2">
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 5: Question Paper Upload */}
          {step === 5 && (
            <div className="p-6 md:p-8 space-y-6 flex-1 flex flex-col justify-between animate-in fade-in zoom-in-95">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-primary/15 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs uppercase font-bold font-mono tracking-widest text-primary">Step 5 of {TOTAL_STEPS}</span>
                  <CardTitle className="text-2xl md:text-3xl font-serif font-bold text-foreground mt-1">Upload Question Paper</CardTitle>
                  <CardDescription className="text-muted-foreground text-sm">Upload PDF or image format (max 15MB).</CardDescription>
                </div>

                {errorMsg && (
                  <p className="text-xs text-destructive bg-destructive/10 p-3.5 rounded-xl border border-destructive/20">{errorMsg}</p>
                )}

                {paperFile ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileCheck className="w-6 h-6 text-primary shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-foreground line-clamp-1">{paperFile.name}</p>
                        <p className="text-xs text-muted-foreground">{(paperFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPaperFile(null)}
                      className="p-1 rounded-lg text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2">
                    <Upload className="w-8 h-8 text-primary" />
                    <span className="text-sm font-semibold text-foreground">Click to upload question paper</span>
                    <span className="text-xs text-muted-foreground">PDF, JPG, PNG up to 15MB</span>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handlePaperFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="pt-4 flex items-center justify-between">
                <Button variant="ghost" onClick={handleBack} className="h-12 px-4 rounded-xl text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button onClick={handleNext} className="h-12 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow-md shadow-primary/20 flex items-center gap-2">
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 6: Blueprint Upload (Optional) */}
          {step === 6 && (
            <div className="p-6 md:p-8 space-y-6 flex-1 flex flex-col justify-between animate-in fade-in zoom-in-95">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-primary/15 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs uppercase font-bold font-mono tracking-widest text-primary">Step 6 of {TOTAL_STEPS} (Optional)</span>
                  <CardTitle className="text-2xl md:text-3xl font-serif font-bold text-foreground mt-1">Upload Blueprint</CardTitle>
                  <CardDescription className="text-muted-foreground text-sm">Upload marking scheme or blueprint if available, or skip this step.</CardDescription>
                </div>

                {errorMsg && (
                  <p className="text-xs text-destructive bg-destructive/10 p-3.5 rounded-xl border border-destructive/20">{errorMsg}</p>
                )}

                {blueprintFile ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileCheck className="w-6 h-6 text-primary shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-foreground line-clamp-1">{blueprintFile.name}</p>
                        <p className="text-xs text-muted-foreground">{(blueprintFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setBlueprintFile(null)}
                      className="p-1 rounded-lg text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-border/80 bg-background/40 hover:bg-background/70 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2">
                    <Upload className="w-8 h-8 text-muted-foreground" />
                    <span className="text-sm font-semibold text-foreground">Click to upload blueprint (Optional)</span>
                    <span className="text-xs text-muted-foreground">PDF, JPG, PNG</span>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleBlueprintFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="pt-4 flex items-center justify-between">
                <Button variant="ghost" onClick={handleBack} className="h-12 px-4 rounded-xl text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button onClick={handleNext} className="h-12 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow-md shadow-primary/20 flex items-center gap-2">
                  <span>Review Exam</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 7: Review & Save as DRAFT */}
          {step === 7 && (
            <div className="p-6 md:p-8 space-y-6 flex-1 flex flex-col justify-between animate-in fade-in zoom-in-95">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-primary/15 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs uppercase font-bold font-mono tracking-widest text-primary">Step 7 of {TOTAL_STEPS}</span>
                  <CardTitle className="text-2xl md:text-3xl font-serif font-bold text-foreground mt-1">Review Examination</CardTitle>
                  <CardDescription className="text-muted-foreground text-sm">Save examination details as DRAFT.</CardDescription>
                </div>

                {errorMsg && (
                  <p className="text-xs text-destructive bg-destructive/10 p-3.5 rounded-xl border border-destructive/20">{errorMsg}</p>
                )}

                <div className="bg-muted/30 rounded-2xl p-4 space-y-3 border border-border/50 text-sm">
                  <div className="flex justify-between items-center border-b border-border/40 pb-2">
                    <span className="text-muted-foreground">Title:</span>
                    <span className="font-semibold text-foreground">{title}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-border/40 pb-2">
                    <span className="text-muted-foreground">Class & Section:</span>
                    <span className="font-semibold text-foreground">{classLevel} ({section})</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-border/40 pb-2">
                    <span className="text-muted-foreground">Subject:</span>
                    <span className="font-semibold text-foreground">{subject}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-border/40 pb-2">
                    <span className="text-muted-foreground">Question Paper:</span>
                    <span className="font-semibold text-foreground">{paperFile ? paperFile.name : 'None attached'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full text-xs">DRAFT</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <Button variant="ghost" onClick={handleBack} disabled={isSubmitting} className="h-12 px-4 rounded-xl text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="h-12 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow-md shadow-primary/20 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving as DRAFT...</span>
                    </>
                  ) : (
                    <>
                      <span>Save as DRAFT</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* STEP 8: Success Redirect */}
          {step === 8 && (
            <div className="p-6 md:p-8 space-y-6 flex-1 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 bg-primary/15 rounded-3xl flex items-center justify-center text-primary shadow-inner mx-auto mb-2 animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-3xl font-serif font-bold text-foreground">Examination Saved!</CardTitle>
                <CardDescription className="text-muted-foreground text-sm max-w-sm mx-auto">
                  "{title}" has been created as a DRAFT. Redirecting to your dashboard...
                </CardDescription>
              </div>
              <Loader2 className="w-5 h-5 text-primary animate-spin mx-auto mt-4" />
            </div>
          )}

        </Card>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-muted-foreground/60 relative z-20 font-serif">
        LearnLens AI — Examination Builder
      </footer>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, Building2, BookOpen, Layers, KeyRound, CheckCircle2, 
  ArrowLeft, ArrowRight, Loader2, Sparkles, Check, ChevronDown
} from 'lucide-react';
import { AmbientAuroraBackground } from '@/components/ui/ambient-aurora-background';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { completeTeacherOnboarding } from '@/app/actions/teacher-auth';
import { triggerHaptic } from '@/lib/haptics';

const SUBJECT_OPTIONS = [
  { id: 'Mathematics', label: 'Mathematics', icon: '📐' },
  { id: 'Physics', label: 'Physics', icon: '⚡' },
  { id: 'Chemistry', label: 'Chemistry', icon: '🧪' },
  { id: 'Biology', label: 'Biology', icon: '🧬' },
  { id: 'English', label: 'English', icon: '📖' },
  { id: 'Computer Science', label: 'Computer Science', icon: '💻' },
  { id: 'Social Studies', label: 'Social Studies', icon: '🌍' },
  { id: 'Hindi', label: 'Hindi', icon: '✍️' },
];

const CLASS_OPTIONS = [
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'
];

export default function TeacherOnboardingPage() {
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [primarySubject, setPrimarySubject] = useState('');
  const [classesTaught, setClassesTaught] = useState<string[]>([]);
  const [passcode, setPasscode] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleNext = () => {
    setErrorMsg(null);
    if (step === 1 && !fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (step === 2 && !schoolName.trim()) {
      setErrorMsg('Please enter your school or institution name.');
      return;
    }
    if (step === 3 && !primarySubject) {
      setErrorMsg('Please select your primary subject.');
      return;
    }
    if (step === 4 && classesTaught.length === 0) {
      setErrorMsg('Please select at least one class grade level you teach.');
      return;
    }
    if (step === 5 && !passcode.trim()) {
      setErrorMsg('Please enter the school admin passcode.');
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

  const toggleClassSelect = (cls: string) => {
    triggerHaptic('light');
    setClassesTaught((prev) => 
      prev.includes(cls) ? prev.filter((c) => c !== cls) : [...prev, cls]
    );
  };

  const handleSubmitOnboarding = async () => {
    triggerHaptic('medium');
    setIsSubmitting(true);
    setErrorMsg(null);

    const result = await completeTeacherOnboarding({
      fullName,
      schoolName,
      primarySubject,
      classesTaught,
      passcode,
    });

    setIsSubmitting(false);

    if (result?.error) {
      setErrorMsg(result.error);
    } else {
      triggerHaptic('success');
      setStep(7);
      setTimeout(() => {
        window.location.href = '/teacher/dashboard';
      }, 1200);
    }
  };

  const TOTAL_STEPS = 6;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-foreground relative overflow-hidden font-sans selection:bg-primary/20">
      <AmbientAuroraBackground variant="auth" />

      {/* Header & Step Indicator */}
      <header className="p-4 md:p-6 relative z-20 max-w-4xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-primary font-bold bg-primary/10 px-3.5 py-1.5 rounded-full border border-primary/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Educator Onboarding</span>
        </div>
        
        {step <= TOTAL_STEPS && (
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5, 6].map((s) => (
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

      {/* Main Content Card */}
      <main className="flex-1 flex items-center justify-center p-4 relative z-10 w-full max-w-xl mx-auto">
        <Card className="w-full shadow-2xl shadow-primary/5 border-primary/25 bg-white/95 backdrop-blur-2xl rounded-3xl overflow-hidden min-h-[440px] flex flex-col justify-between">
          
          {/* STEP 1: Full Name */}
          {step === 1 && (
            <div className="p-6 md:p-8 space-y-6 flex-1 flex flex-col justify-between animate-in fade-in zoom-in-95">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-primary/15 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs uppercase font-bold font-mono tracking-widest text-primary">Step 1 of {TOTAL_STEPS}</span>
                  <CardTitle className="text-2xl md:text-3xl font-serif font-bold text-foreground mt-1">What is your full name?</CardTitle>
                  <CardDescription className="text-muted-foreground text-sm">This name will be displayed on student examination blueprints.</CardDescription>
                </div>

                {errorMsg && (
                  <p className="text-xs text-destructive bg-destructive/10 p-3 rounded-xl border border-destructive/20">{errorMsg}</p>
                )}

                <div className="pt-2">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Shaik Aakif"
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

          {/* STEP 2: School Name */}
          {step === 2 && (
            <div className="p-6 md:p-8 space-y-6 flex-1 flex flex-col justify-between animate-in fade-in zoom-in-95">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-primary/15 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs uppercase font-bold font-mono tracking-widest text-primary">Step 2 of {TOTAL_STEPS}</span>
                  <CardTitle className="text-2xl md:text-3xl font-serif font-bold text-foreground mt-1">Where do you teach?</CardTitle>
                  <CardDescription className="text-muted-foreground text-sm">Enter the school or institution name you represent.</CardDescription>
                </div>

                {errorMsg && (
                  <p className="text-xs text-destructive bg-destructive/10 p-3 rounded-xl border border-destructive/20">{errorMsg}</p>
                )}

                <div className="pt-2">
                  <input
                    type="text"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder="e.g. GATEWAY INTERNATIONAL HIGH SCHOOL"
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

          {/* STEP 3: Primary Subject (Clean Custom Grid, No Ugly Scrollbar) */}
          {step === 3 && (
            <div className="p-6 md:p-8 space-y-5 flex-1 flex flex-col justify-between animate-in fade-in zoom-in-95">
              <div className="space-y-3">
                <div className="w-12 h-12 bg-primary/15 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs uppercase font-bold font-mono tracking-widest text-primary">Step 3 of {TOTAL_STEPS}</span>
                  <CardTitle className="text-2xl md:text-3xl font-serif font-bold text-foreground mt-1">What is your primary subject?</CardTitle>
                  <CardDescription className="text-muted-foreground text-sm">Select the main discipline you teach.</CardDescription>
                </div>

                {errorMsg && (
                  <p className="text-xs text-destructive bg-destructive/10 p-3 rounded-xl border border-destructive/20">{errorMsg}</p>
                )}

                {/* Clean 2-column grid without scrollbar */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  {SUBJECT_OPTIONS.map((sub) => {
                    const isSelected = primarySubject === sub.id;
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          setPrimarySubject(sub.id);
                        }}
                        className={`p-3 rounded-xl text-left border flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-primary/10 border-primary text-foreground font-semibold ring-2 ring-primary/20 shadow-sm scale-[1.02]'
                            : 'bg-background/50 border-border/80 hover:border-primary/50 text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <span className="text-xs md:text-sm flex items-center gap-2">
                          <span>{sub.icon}</span>
                          <span className="truncate">{sub.label}</span>
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-primary shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-muted-foreground/70 font-mono">
                  <span className="border-b border-dotted border-primary/40 w-12" />
                  <span>Select 1 primary discipline</span>
                  <span className="border-b border-dotted border-primary/40 w-12" />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
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

          {/* STEP 4: Classes Taught */}
          {step === 4 && (
            <div className="p-6 md:p-8 space-y-6 flex-1 flex flex-col justify-between animate-in fade-in zoom-in-95">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-primary/15 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs uppercase font-bold font-mono tracking-widest text-primary">Step 4 of {TOTAL_STEPS}</span>
                  <CardTitle className="text-2xl md:text-3xl font-serif font-bold text-foreground mt-1">Which classes do you teach?</CardTitle>
                  <CardDescription className="text-muted-foreground text-sm">Select all grade levels you currently instruct.</CardDescription>
                </div>

                {errorMsg && (
                  <p className="text-xs text-destructive bg-destructive/10 p-3 rounded-xl border border-destructive/20">{errorMsg}</p>
                )}

                <div className="flex flex-wrap gap-2.5 pt-2">
                  {CLASS_OPTIONS.map((cls) => {
                    const isSelected = classesTaught.includes(cls);
                    return (
                      <button
                        key={cls}
                        type="button"
                        onClick={() => toggleClassSelect(cls)}
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

          {/* STEP 5: School Admin Passcode */}
          {step === 5 && (
            <div className="p-6 md:p-8 space-y-6 flex-1 flex flex-col justify-between animate-in fade-in zoom-in-95">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-primary/15 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                  <KeyRound className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs uppercase font-bold font-mono tracking-widest text-primary">Step 5 of {TOTAL_STEPS}</span>
                  <CardTitle className="text-2xl md:text-3xl font-serif font-bold text-foreground mt-1">School Admin Passcode</CardTitle>
                  <CardDescription className="text-muted-foreground text-sm">
                    Enter the authorized school passcode to verify educator identity.
                  </CardDescription>
                </div>

                {errorMsg && (
                  <p className="text-xs text-destructive bg-destructive/10 p-3 rounded-xl border border-destructive/20">{errorMsg}</p>
                )}

                <div className="pt-2">
                  <input
                    type="password"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Enter admin passcode"
                    autoFocus
                    className="flex h-12 w-full rounded-xl border border-border/80 bg-background/60 px-4 py-2 text-base aurora-input focus-visible:outline-none placeholder:text-muted-foreground/60 transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 font-medium"
                  />
                  <p className="text-[11px] text-muted-foreground/70 mt-2 font-mono">
                    Provided by your school administrator (Demo Passcode: learnlens@2026)
                  </p>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <Button variant="ghost" onClick={handleBack} className="h-12 px-4 rounded-xl text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button onClick={handleNext} className="h-12 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow-md shadow-primary/20 flex items-center gap-2">
                  <span>Review Profile</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 6: Review & Confirm */}
          {step === 6 && (
            <div className="p-6 md:p-8 space-y-6 flex-1 flex flex-col justify-between animate-in fade-in zoom-in-95">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-primary/15 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs uppercase font-bold font-mono tracking-widest text-primary">Step 6 of {TOTAL_STEPS}</span>
                  <CardTitle className="text-2xl md:text-3xl font-serif font-bold text-foreground mt-1">Review Your Profile</CardTitle>
                  <CardDescription className="text-muted-foreground text-sm">Confirm details before completing setup.</CardDescription>
                </div>

                {errorMsg && (
                  <p className="text-xs text-destructive bg-destructive/10 p-3 rounded-xl border border-destructive/20">{errorMsg}</p>
                )}

                <div className="bg-muted/30 rounded-2xl p-4 space-y-3 border border-border/50 text-sm">
                  <div className="flex justify-between items-center border-b border-border/40 pb-2">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-semibold text-foreground">{fullName}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-border/40 pb-2">
                    <span className="text-muted-foreground">School:</span>
                    <span className="font-semibold text-foreground">{schoolName}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-border/40 pb-2">
                    <span className="text-muted-foreground">Primary Subject:</span>
                    <span className="font-semibold text-foreground">{primarySubject}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-border/40 pb-2">
                    <span className="text-muted-foreground">Classes:</span>
                    <span className="font-semibold text-foreground">{classesTaught.join(', ')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Verification:</span>
                    <span className="font-semibold text-primary flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Passcode Verified
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <Button variant="ghost" onClick={handleBack} disabled={isSubmitting} className="h-12 px-4 rounded-xl text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button
                  onClick={handleSubmitOnboarding}
                  disabled={isSubmitting}
                  className="h-12 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow-md shadow-primary/20 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Setup</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* STEP 7: Success Screen */}
          {step === 7 && (
            <div className="p-6 md:p-8 space-y-6 flex-1 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 bg-primary/15 rounded-3xl flex items-center justify-center text-primary shadow-inner mx-auto mb-2 animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-3xl font-serif font-bold text-foreground">All Set, {fullName}!</CardTitle>
                <CardDescription className="text-muted-foreground text-sm max-w-sm mx-auto">
                  Your educator profile has been saved. Redirecting to your Teacher Dashboard...
                </CardDescription>
              </div>
              <Loader2 className="w-5 h-5 text-primary animate-spin mx-auto mt-4" />
            </div>
          )}

        </Card>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-muted-foreground/60 relative z-20 font-serif">
        LearnLens AI — Teacher Onboarding Complete
      </footer>
    </div>
  );
}

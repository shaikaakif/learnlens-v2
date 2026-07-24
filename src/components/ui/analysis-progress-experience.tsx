"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, AlertCircle, RotateCcw, ArrowLeft, Brain } from "lucide-react";
import { Button } from "./button";
import { AmbientAuroraBackground } from "./ambient-aurora-background";
import { vibrateSuccess, vibrateError, vibrateLight } from "@/lib/haptics";

type ProgressStage = 
  | 'idle' 
  | 'uploading' 
  | 'analyzing' 
  | 'validating' 
  | 'completed' 
  | 'failed';

interface AnalysisProgressExperienceProps {
  state: ProgressStage;
  fileCount?: number;
  error?: string | null;
  onRetry: () => void;
  onCancel: () => void;
}

// 6 Core Milestone Stages for the Vertical Timeline
const MILESTONE_STAGES = [
  "Upload & Secure Session",
  "Validation & Sheet Classification",
  "Detecting Questions & Diagrams",
  "Reading Handwriting & OCR",
  "Understanding Student Responses",
  "Applying Learning MRI & Report"
];

// Contextual AI Status Messages to rotate smoothly under Current Stage
const CONTEXTUAL_MESSAGES = [
  "Preparing secure upload...",
  "Validating answer sheet...",
  "Separating questions...",
  "Reading handwriting...",
  "Detecting diagrams...",
  "Understanding responses...",
  "Applying Learning MRI...",
  "Building personalized report...",
  "Performing final verification...",
  "Generating recommendations..."
];

export function AnalysisProgressExperience({ 
  state, 
  fileCount = 1,
  error, 
  onRetry, 
  onCancel
}: AnalysisProgressExperienceProps) {
  const [mounted, setMounted] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [estimatedSeconds, setEstimatedSeconds] = useState(Math.max(20, fileCount * 22));
  const wakeLockRef = useRef<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Screen Wake Lock API management
  useEffect(() => {
    let released = false;

    async function requestWakeLock() {
      try {
        if ('wakeLock' in navigator && (state === 'uploading' || state === 'analyzing' || state === 'validating')) {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        }
      } catch (err) {
        console.warn("Screen Wake Lock unavailable or denied:", err);
      }
    }

    requestWakeLock();

    return () => {
      if (wakeLockRef.current && !released) {
        released = true;
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    };
  }, [state]);

  // Lock body scroll & prevent accidental navigation
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (state === 'uploading' || state === 'analyzing' || state === 'validating') {
        e.preventDefault();
        e.returnValue = "Analysis is in progress. Leaving will cancel the session.";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [state]);

  // Milestone Step Rotation + Milestone Haptics
  useEffect(() => {
    if (state === 'uploading') {
      setCurrentStepIndex(0);
      vibrateLight();
    } else if (state === 'analyzing' || state === 'validating') {
      let step = currentStepIndex < 1 ? 1 : currentStepIndex;
      setCurrentStepIndex(step);
      vibrateLight();

      const interval = setInterval(() => {
        if (step < MILESTONE_STAGES.length - 1) {
          step++;
          setCurrentStepIndex(step);
          vibrateLight(); // Milestone haptic tap
        }
      }, 4000);

      return () => clearInterval(interval);
    } else if (state === 'completed') {
      setCurrentStepIndex(MILESTONE_STAGES.length - 1);
      vibrateSuccess();
    } else if (state === 'failed') {
      vibrateError();
    }
  }, [state]);

  // Rotate Contextual AI Status Messages
  useEffect(() => {
    if (state !== 'analyzing' && state !== 'validating' && state !== 'uploading') return;

    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % CONTEXTUAL_MESSAGES.length);
    }, 2800);

    return () => clearInterval(interval);
  }, [state]);

  // Dynamic estimated time countdown
  useEffect(() => {
    if (state !== 'uploading' && state !== 'analyzing' && state !== 'validating') return;

    const interval = setInterval(() => {
      setEstimatedSeconds((prev) => Math.max(3, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [state]);

  if (!mounted) return null;

  const isFailed = state === 'failed';

  // Extract previous, current, and next steps for the 3-state focused view
  const prevStep = currentStepIndex > 0 ? MILESTONE_STAGES[currentStepIndex - 1] : null;
  const currentStep = MILESTONE_STAGES[currentStepIndex];
  const nextStep = currentStepIndex < MILESTONE_STAGES.length - 1 ? MILESTONE_STAGES[currentStepIndex + 1] : null;

  const overlayContent = (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col justify-between overflow-hidden select-none p-6 md:p-12 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
      
      {/* Living Aurora Background - Reduced Opacity 6% for zero visual distraction */}
      <AmbientAuroraBackground variant="hero" className="opacity-[0.06] pointer-events-none" />

      {/* TOP: Header Title & Subtitle */}
      <div className="relative z-10 text-center space-y-1">
        <div className="flex items-center justify-center gap-2">
          <Brain className="w-5 h-5 text-primary opacity-80" />
          <h2 className="text-sm font-semibold tracking-wider uppercase text-foreground/90 font-serif">
            Learn<span className="text-primary italic">Lens</span> AI Engine
          </h2>
        </div>
        <p className="text-xs text-muted-foreground/70 tracking-wide font-sans">
          Secure Analysis Session
        </p>
      </div>

      {/* MIDDLE: Focused 3-State Apple-Style Step View & Vertical Progress Timeline */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center my-auto w-full max-w-lg mx-auto">
        
        {isFailed ? (
          /* Error / Interrupted Card */
          <div className="w-full bg-card/90 backdrop-blur-md rounded-3xl border border-destructive/20 p-8 shadow-xl space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="w-14 h-14 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto text-destructive border border-destructive/20">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-serif font-bold text-foreground">Analysis Interrupted</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                {error || "The assessment analysis was interrupted. You can resume immediately from your draft pages."}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button variant="outline" onClick={onCancel} className="rounded-xl h-11 px-5 gap-2 text-sm">
                <ArrowLeft className="w-4 h-4" /> Back to Analyze
              </Button>
              <Button onClick={onRetry} className="rounded-xl h-11 px-5 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm">
                <RotateCcw className="w-4 h-4" /> Resume Analysis
              </Button>
            </div>
          </div>
        ) : (
          /* Single-Task Apple-Style Step Focus */
          <div className="w-full flex flex-col items-center space-y-10">
            
            {/* Minimal Icon (Scaled gently) */}
            <div className="w-16 h-16 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm transition-transform duration-700 ease-in-out scale-100 hover:scale-105">
              <Brain className="w-8 h-8 animate-pulse text-primary" />
            </div>

            {/* 3-State Step Focus Display (Previous, Current, Next) */}
            <div className="w-full space-y-4 text-center min-h-[160px] flex flex-col items-center justify-center">
              
              {/* PREVIOUS STEP (16px Medium, 40% Opacity, Green Tick) */}
              <div className="h-7 flex items-center justify-center gap-2 transition-all duration-500 ease-in-out">
                {prevStep ? (
                  <div className="flex items-center gap-2 text-foreground/40 font-medium text-base animate-in fade-in slide-in-from-bottom-2 duration-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 animate-in zoom-in-75 duration-300" />
                    <span>{prevStep}</span>
                  </div>
                ) : (
                  <div className="h-7" />
                )}
              </div>

              {/* CURRENT STEP (32px Semibold, 100% Opacity, Glowing Node) */}
              <div className="space-y-2 py-1 transition-all duration-500 ease-in-out">
                <h3 className="text-2xl sm:text-3xl font-serif font-semibold text-foreground tracking-tight text-balance animate-in fade-in slide-in-from-bottom-3 duration-500">
                  {currentStep}
                </h3>
                {/* Contextual AI Status Message */}
                <p className="text-sm font-sans text-primary/80 font-medium h-5 transition-opacity duration-300 animate-in fade-in">
                  {CONTEXTUAL_MESSAGES[messageIndex]}
                </p>
              </div>

              {/* NEXT STEP (18px Medium, 35% Opacity) */}
              <div className="h-7 flex items-center justify-center transition-all duration-500 ease-in-out">
                {nextStep ? (
                  <div className="text-muted-foreground/35 font-medium text-[17px] animate-in fade-in slide-in-from-bottom-2 duration-400">
                    {nextStep}
                  </div>
                ) : (
                  <div className="h-7 text-xs text-emerald-600 font-semibold uppercase tracking-wider">
                    Finalizing Report...
                  </div>
                )}
              </div>

            </div>

            {/* Thin Vertical Progress Timeline Nodes */}
            <div className="flex items-center gap-2.5 pt-2">
              {MILESTONE_STAGES.map((_, idx) => {
                const isPast = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div key={idx} className="flex items-center gap-2">
                    <div
                      className={`transition-all duration-500 rounded-full ${
                        isPast
                          ? "w-2.5 h-2.5 bg-emerald-500"
                          : isCurrent
                          ? "w-3 h-3 bg-primary ring-4 ring-primary/20 animate-pulse"
                          : "w-2 h-2 bg-border/60"
                      }`}
                    />
                    {idx < MILESTONE_STAGES.length - 1 && (
                      <div className={`h-0.5 w-4 transition-colors duration-500 ${isPast ? 'bg-emerald-500/60' : 'bg-border/40'}`} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Estimated Remaining Time Display */}
            <div className="text-xs font-mono text-muted-foreground/70 tracking-wider">
              Estimated remaining time: ≈ {estimatedSeconds}s
            </div>

          </div>
        )}

      </div>

      {/* BOTTOM: Minimal Subdued Cancel Button (Dotted Outline, Gray, 70% Opacity) */}
      <div className="relative z-10 flex justify-center pb-2">
        {!isFailed && (
          <button
            onClick={onCancel}
            className="border border-dashed border-border/80 text-muted-foreground/80 hover:border-destructive/50 hover:text-destructive hover:bg-destructive/5 hover:border-solid text-xs font-medium rounded-full px-5 py-2 transition-all opacity-70 hover:opacity-100 active:scale-95"
            aria-label="Cancel Analysis"
          >
            Cancel Analysis
          </button>
        )}
      </div>

    </div>
  );

  return createPortal(overlayContent, document.body);
}

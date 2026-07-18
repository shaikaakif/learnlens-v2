"use client";

import { useEffect, useState } from "react";
import { InsightField } from "./insight-field";
import { Button } from "./button";
import { AlertCircle, ArrowLeft, RotateCcw } from "lucide-react";
import { vibrateSuccess, vibrateError } from "@/lib/haptics";

type ProgressStage = 
  | 'idle' 
  | 'uploading' 
  | 'analyzing' 
  | 'validating' 
  | 'completed' 
  | 'failed';

interface AnalysisProgressExperienceProps {
  state: ProgressStage;
  error?: string | null;
  onRetry: () => void;
  onCancel: () => void;
}

const STAGES = ["READ", "CONNECT", "UNDERSTAND", "REVEAL"];

export function AnalysisProgressExperience({ 
  state, 
  error, 
  onRetry, 
  onCancel
}: AnalysisProgressExperienceProps) {
  const [progress, setProgress] = useState(0);
  const [activeStageIndex, setActiveStageIndex] = useState(0);

  useEffect(() => {
    let animationFrame: number;
    let targetProgress = 0;

    if (state === 'idle') {
      targetProgress = 0;
    } else if (state === 'uploading') {
      targetProgress = 15;
    } else if (state === 'analyzing') {
      targetProgress = 85;
    } else if (state === 'validating') {
      targetProgress = 95;
    } else if (state === 'completed') {
      targetProgress = 100;
    } else if (state === 'failed') {
      targetProgress = progress; // freeze
    }

    const updateProgress = () => {
      setProgress(prev => {
        if (state === 'failed') return prev;
        
        // Easing towards target
        const diff = targetProgress - prev;
        if (Math.abs(diff) < 0.1) return targetProgress;
        
        // Slower easing for the long 'analyzing' phase to simulate processing
        const easeAmount = (state === 'analyzing' && prev > 25) ? 0.002 : 0.05;
        return prev + diff * easeAmount;
      });
      animationFrame = requestAnimationFrame(updateProgress);
    };

    animationFrame = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(animationFrame);
  }, [state]);

  useEffect(() => {
    // Map progress percentage to the 4 stages
    if (progress < 25) setActiveStageIndex(0);
    else if (progress < 60) setActiveStageIndex(1);
    else if (progress < 95) setActiveStageIndex(2);
    else setActiveStageIndex(3);
  }, [progress]);

  useEffect(() => {
    if (state === 'completed') {
      vibrateSuccess();
    } else if (state === 'failed') {
      vibrateError();
    }
  }, [state]);

  let statusMessage = "Reading your responses...";
  if (state === 'analyzing') {
    if (progress < 40) statusMessage = "Connecting answers with questions...";
    else if (progress < 70) statusMessage = "Looking for learning patterns...";
    else statusMessage = "Building your Learning MRI...";
  } else if (state === 'validating') {
    statusMessage = "Your insights are almost ready...";
  } else if (state === 'completed') {
    statusMessage = "Your Learning MRI is ready.";
  } else if (state === 'failed') {
    statusMessage = "Analysis interrupted.";
  }

  const isCompleted = state === 'completed';
  const isFailed = state === 'failed';

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background overflow-hidden">
      
      {/* Background breathing Insight Field */}
      <InsightField 
        variant="analysis" 
        interactive={false} 
        className={`transition-all duration-1000 ease-out ${isCompleted ? 'scale-150 opacity-0 blur-2xl' : 'scale-100 opacity-100'}`} 
      />

      <div className={`relative z-10 w-full max-w-lg mx-auto p-8 flex flex-col items-center text-center transition-all duration-1000 ${isCompleted ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0'}`}>
        
        <h2 className="text-3xl font-serif text-slate-800 mb-2 transition-all duration-500 ease-in-out font-medium min-h-[40px]">
          {statusMessage}
        </h2>
        
        <p className="text-slate-500 text-sm font-sans tracking-widest uppercase mb-12 opacity-80 h-[20px]">
          LearnLens AI Intelligence
        </p>

        {isFailed ? (
          <div className="w-full bg-white/70 backdrop-blur-md rounded-2xl border border-destructive/20 p-6 shadow-xl animate-in fade-in slide-in-from-bottom-4">
            <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4 text-destructive">
              <AlertCircle className="w-6 h-6" />
            </div>
            <p className="text-destructive font-medium mb-2">We encountered an issue.</p>
            <p className="text-slate-600 text-sm mb-6 max-w-sm mx-auto">
              {error || "We analyzed your answer sheet, but the result could not be structured correctly. Please try again."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" onClick={onCancel} className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Return to Assessment
              </Button>
              <Button onClick={onRetry} className="gap-2">
                <RotateCcw className="w-4 h-4" /> Try Again
              </Button>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-md mx-auto relative" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
            {/* The Stages Text */}
            <div className="flex justify-between w-full mb-6 relative">
              {STAGES.map((stage, i) => (
                <div key={stage} className={`text-[10px] font-sans tracking-[0.2em] transition-all duration-700 ${activeStageIndex >= i ? 'text-primary font-bold' : 'text-slate-400/50'}`}>
                  {stage}
                </div>
              ))}
            </div>

            {/* The Track */}
            <div className="w-full h-1 bg-black/5 rounded-full relative overflow-hidden">
              
              {/* Luminous Highlight */}
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-transparent via-primary/50 to-primary rounded-full transition-transform duration-75 ease-linear"
                style={{
                  width: '100%',
                  transform: `translateX(-${100 - progress}%)`
                }}
              >
                {/* Leading Edge Glow */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full blur-[2px] shadow-[0_0_12px_4px_rgba(92,153,102,0.6)] mix-blend-screen" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

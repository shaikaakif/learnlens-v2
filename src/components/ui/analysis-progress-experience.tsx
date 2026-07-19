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

const EDUCATIONAL_FACTS = [
  "Understanding why you lost one mark can prevent the same mistake across multiple questions.",
  "Your score tells you what happened. Your mistake patterns can tell you what to improve.",
  "LearnLens separates conceptual gaps from execution mistakes.",
  "Strong students don't only review wrong answers—they investigate why the mistake happened.",
  "Full marks and a perfect answer are not always the same—but full-mark answers should never be classified as mark loss.",
  "Small calculation errors can reveal patterns that are easy to fix with targeted practice."
];

const ANALYZING_STAGES = [
  "Preparing your assessment...",
  "Reading assessment pages...",
  "Detecting your official score...",
  "Mapping questions and answers...",
  "Inspecting teacher markings...",
  "Analyzing your learning patterns...",
  "Verifying findings...",
  "Preparing your Learning MRI..."
];

export function AnalysisProgressExperience({ 
  state, 
  error, 
  onRetry, 
  onCancel
}: AnalysisProgressExperienceProps) {
  const [factIndex, setFactIndex] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(45); // default estimate 45s
  
  // Fact rotation
  useEffect(() => {
    if (state !== 'analyzing') return;
    const interval = setInterval(() => {
      setFactIndex(prev => (prev + 1) % EDUCATIONAL_FACTS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [state]);

  // Stage rotation (fake progress through stages)
  useEffect(() => {
    if (state === 'uploading') {
      setStageIndex(0);
    } else if (state === 'analyzing') {
      let currentStage = 1;
      setStageIndex(currentStage);
      const interval = setInterval(() => {
        if (currentStage < ANALYZING_STAGES.length - 1) {
          currentStage++;
          setStageIndex(currentStage);
        }
      }, 5000);
      return () => clearInterval(interval);
    } else if (state === 'validating') {
      setStageIndex(ANALYZING_STAGES.length - 1);
    }
  }, [state]);

  // Timer countdown
  useEffect(() => {
    if (state !== 'analyzing' && state !== 'validating') return;
    const interval = setInterval(() => {
      setTimeRemaining(prev => Math.max(1, prev - 1)); // Never reach 0
    }, 1000);
    return () => clearInterval(interval);
  }, [state]);

  useEffect(() => {
    if (state === 'completed') {
      vibrateSuccess();
    } else if (state === 'failed') {
      vibrateError();
    }
  }, [state]);

  let statusMessage = "LearnLens Intelligence";
  if (state === 'uploading') statusMessage = "Securely uploading images...";
  else if (state === 'analyzing' || state === 'validating') statusMessage = ANALYZING_STAGES[stageIndex];
  else if (state === 'completed') statusMessage = "Your Learning MRI is ready.";
  else if (state === 'failed') statusMessage = "Analysis interrupted.";

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
        
        <h2 className="text-2xl sm:text-3xl font-serif text-slate-800 mb-2 transition-all duration-500 ease-in-out font-medium min-h-[40px] animate-in fade-in">
          {statusMessage}
        </h2>
        
        <p className="text-slate-500 text-sm font-sans tracking-widest uppercase mb-8 opacity-80">
          LearnLens AI
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
          <div className="w-full max-w-md mx-auto flex flex-col items-center space-y-6">
            
            {/* Indeterminate Progress Glow Track */}
            <div className="w-full h-1.5 bg-black/5 rounded-full relative overflow-hidden">
              <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full animate-[shimmer_2s_infinite]" />
            </div>

            {/* Time Estimate */}
            {(state === 'analyzing' || state === 'validating') && (
              <div className="text-sm font-medium text-slate-600 animate-in fade-in transition-all">
                {timeRemaining > 5 
                  ? `Estimated time remaining: ~${timeRemaining} seconds`
                  : "Finishing your detailed analysis..."}
              </div>
            )}

            {/* Rotating Educational Fact */}
            {(state === 'analyzing' || state === 'validating') && (
              <div className="mt-8 relative h-24 w-full px-4 flex items-center justify-center">
                {EDUCATIONAL_FACTS.map((fact, idx) => (
                  <p 
                    key={idx}
                    className={`absolute text-slate-700 italic text-sm sm:text-base transition-all duration-1000 ${
                      idx === factIndex 
                        ? 'opacity-100 translate-y-0 scale-100' 
                        : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
                    }`}
                  >
                    "{fact}"
                  </p>
                ))}
              </div>
            )}
            
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}} />
    </div>
  );
}

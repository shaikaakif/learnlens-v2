"use client";

import { useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ConfidenceLevel } from '@/types';

function ConfidenceBadge({ level }: { level?: ConfidenceLevel }) {
  if (!level) return null;
  const colors = {
    high: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    low: "bg-muted text-muted-foreground border-border"
  };
  const percentage = level === 'high' ? '97%' : level === 'medium' ? '82%' : '65%';
  return (
    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${colors[level]}`}>
      Confidence {percentage}
    </span>
  );
}

interface IssueProps {
  category: string;
  confidence?: ConfidenceLevel;
  description: string;
  evidence?: string;
  transcription?: string;
}

export function ExpandableIssue({ issue }: { issue: IssueProps }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div 
      className="p-5 sm:p-6 flex flex-col hover:bg-muted/20 transition-colors cursor-pointer border-b border-border/40 last:border-0"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex flex-col sm:flex-row gap-4 sm:items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="capitalize bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 font-semibold px-3 py-0.5">
              {issue.category.replace('_', ' ')}
            </Badge>
            <ConfidenceBadge level={issue.confidence} />
          </div>
          <p className="text-foreground/90 text-base leading-relaxed font-medium pt-1">
            {issue.description}
          </p>
        </div>

        <button 
          className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors shrink-0 mt-2 sm:mt-1 bg-muted/40 hover:bg-primary/10 px-3 py-1.5 rounded-full border border-border/50"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
        >
          <span>{isExpanded ? 'Hide Details' : 'Tap to Expand'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expanded Diagnostic Evidence Block */}
      {isExpanded && (
        <div 
          className="mt-5 space-y-4 pt-4 border-t border-border/40 animate-in slide-in-from-top-2 fade-in duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Evidence snippet */}
          {issue.evidence && (
            <div className="bg-card p-4 rounded-xl border border-border/60 space-y-1.5 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider">
                <FileText className="w-3.5 h-3.5 text-primary" />
                <span>Extracted Answer Evidence</span>
              </div>
              <p className="text-sm font-mono text-muted-foreground leading-relaxed pl-5 border-l-2 border-primary/40 italic">
                "{issue.evidence}"
              </p>
            </div>
          )}

          {/* Teacher Diagnostic Reasoning */}
          <div className="bg-primary/5 p-4 rounded-xl border border-primary/15 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>AI Diagnostic Reasoning</span>
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed font-sans">
              {issue.description} Focus on addressing this conceptual pattern to recover potential marks in future assessments.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

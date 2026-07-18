"use client";

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ConfidenceLevel } from '@/types';

function ConfidenceBadge({ level }: { level?: ConfidenceLevel }) {
  if (!level) return null;
  const colors = {
    high: "bg-success/10 text-success border-success/20",
    medium: "bg-warning/10 text-warning border-warning/20",
    low: "bg-muted text-muted-foreground border-border"
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${colors[level]}`}>
      {level.charAt(0).toUpperCase() + level.slice(1)} Confidence
    </span>
  );
}

interface IssueProps {
  category: string;
  confidence?: ConfidenceLevel;
  description: string;
  evidence?: string;
}

export function ExpandableIssue({ issue }: { issue: IssueProps }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="p-4 sm:p-6 flex flex-col hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
      <div className="flex flex-col md:flex-row gap-4 md:items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="capitalize bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">
              {issue.category.replace('_', ' ')}
            </Badge>
            <ConfidenceBadge level={issue.confidence} />
          </div>
          <p className="text-foreground/90 leading-relaxed font-medium">{issue.description}</p>
        </div>
        
        {issue.evidence && (
          <button 
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors shrink-0 mt-2 md:mt-0"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? 'Hide Evidence' : 'Show Evidence'}
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        )}
      </div>

      {isExpanded && issue.evidence && (
        <div 
          className="mt-4 text-sm bg-muted/50 p-4 rounded-xl border border-border/60 text-muted-foreground font-mono animate-in slide-in-from-top-2 fade-in duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="font-semibold text-foreground font-sans block mb-1">Evidence from your answer:</span>
          "{issue.evidence}"
        </div>
      )}
    </div>
  );
}

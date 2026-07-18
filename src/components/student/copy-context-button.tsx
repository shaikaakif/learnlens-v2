"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';

interface CopyContextButtonProps {
  contextText: string;
}

export function CopyContextButton({ contextText }: CopyContextButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(contextText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <Button 
      variant="secondary" 
      className="gap-2 transition-all" 
      onClick={handleCopy}
    >
      {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />} 
      {copied ? 'Copied!' : 'Copy Context'}
    </Button>
  );
}

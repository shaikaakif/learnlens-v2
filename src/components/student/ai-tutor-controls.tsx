"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, ExternalLink, Loader2, Sparkles } from "lucide-react";
import { openAITutor, copyPromptToClipboard } from "@/lib/open-ai-tutor";

interface AiTutorControlsProps {
  promptText: string;
}

export function AiTutorControls({ promptText }: AiTutorControlsProps) {
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [loadingProvider, setLoadingProvider] = useState<"chatgpt" | "gemini" | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const handleCopy = async () => {
    const success = await copyPromptToClipboard(promptText);
    if (success) {
      setCopied(true);
      showToast("Prompt copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLaunch = async (provider: "chatgpt" | "gemini") => {
    setLoadingProvider(provider);
    try {
      await openAITutor(provider, promptText, (msg) => showToast(msg));
    } catch (err) {
      console.error(`Failed to launch ${provider}:`, err);
    } finally {
      setTimeout(() => setLoadingProvider(null), 1000);
    }
  };

  return (
    <div className="space-y-4 relative z-10">
      
      {/* Action Buttons Group */}
      <div className="flex flex-wrap gap-4 pt-2">
        
        {/* Copy Context Button */}
        <Button
          variant="secondary"
          className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 gap-2 h-12 px-6 rounded-xl font-medium transition-transform active:scale-95"
          onClick={handleCopy}
          aria-label="Copy Context Prompt"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied!" : "Copy Context"}
        </Button>

        {/* Open ChatGPT Button */}
        <Button
          variant="outline"
          className="bg-white/5 hover:bg-white/10 border-white/20 text-white gap-2 h-12 px-6 rounded-xl font-medium transition-all active:scale-95 disabled:opacity-70"
          onClick={() => handleLaunch("chatgpt")}
          disabled={loadingProvider === "chatgpt"}
          aria-label="Open ChatGPT AI Tutor"
        >
          {loadingProvider === "chatgpt" ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : (
            <ExternalLink className="w-4 h-4" />
          )}
          Open ChatGPT
        </Button>

        {/* Open Gemini Button */}
        <Button
          variant="outline"
          className="bg-white/5 hover:bg-white/10 border-white/20 text-white gap-2 h-12 px-6 rounded-xl font-medium transition-all active:scale-95 disabled:opacity-70"
          onClick={() => handleLaunch("gemini")}
          disabled={loadingProvider === "gemini"}
          aria-label="Open Gemini AI Tutor"
        >
          {loadingProvider === "gemini" ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : (
            <ExternalLink className="w-4 h-4" />
          )}
          Open Gemini
        </Button>

      </div>

      {/* Lightweight Success Toast */}
      {toastMessage && (
        <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm font-medium shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}

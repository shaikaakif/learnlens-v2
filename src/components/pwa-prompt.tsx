"use client";

import { useState, useEffect } from "react";
import { X, Download } from "lucide-react";
import { Button } from "./ui/button";

export function PWAPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show prompt if we haven't dismissed it recently
      const dismissed = localStorage.getItem("pwa-prompt-dismissed");
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-prompt-dismissed", "true");
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:bottom-6 md:left-auto md:right-6 md:w-96 z-50 animate-in slide-in-from-bottom-10 fade-in duration-500">
      <div className="bg-card border border-border rounded-2xl p-4 shadow-xl flex items-start gap-4">
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
          <Download className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1 pt-1">
          <h4 className="font-semibold text-foreground">Install LearnLens</h4>
          <p className="text-sm text-muted-foreground mt-1 mb-3">Add to your home screen for the best experience.</p>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleInstall} className="flex-1">Install</Button>
            <Button size="sm" variant="outline" onClick={handleDismiss}>Not now</Button>
          </div>
        </div>
        <button onClick={handleDismiss} className="text-muted-foreground hover:text-foreground shrink-0 p-1">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

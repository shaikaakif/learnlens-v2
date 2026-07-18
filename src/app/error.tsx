"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service in production
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center space-y-6">
      <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center text-destructive mb-2">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <div className="space-y-2 max-w-md">
        <h2 className="text-3xl font-serif font-bold text-foreground">We hit a snag</h2>
        <p className="text-muted-foreground text-lg">
          Something unexpected happened while loading this page. 
          {error.message ? ` Details: ${error.message}` : ''}
        </p>
      </div>
      <Button 
        onClick={() => reset()} 
        size="lg"
        className="gap-2"
      >
        <RefreshCcw className="w-4 h-4" />
        Try Again
      </Button>
    </div>
  );
}

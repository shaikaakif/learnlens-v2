import { Loader2 } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
      <div className="relative w-20 h-20 flex items-center justify-center">
        <div className="absolute inset-0 border-4 border-primary/20 rounded-full animate-ping opacity-30 duration-1000"></div>
        <Loader2 className="w-8 h-8 animate-spin text-primary relative z-10" />
      </div>
      <p className="text-muted-foreground font-medium animate-pulse">Loading LearnLens...</p>
    </div>
  );
}

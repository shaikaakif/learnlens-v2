export default function Loading() {
  return (
    <div className="w-full h-full animate-pulse space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted rounded-md" />
          <div className="h-4 w-72 bg-muted/60 rounded-md" />
        </div>
        <div className="h-10 w-24 bg-muted rounded-md" />
      </div>

      <div className="grid md:grid-cols-3 gap-6 pt-4">
        <div className="h-32 bg-muted/40 rounded-xl border border-border/50" />
        <div className="h-32 bg-muted/40 rounded-xl border border-border/50" />
        <div className="h-32 bg-muted/40 rounded-xl border border-border/50" />
      </div>

      <div className="pt-8 space-y-4">
        <div className="h-6 w-36 bg-muted rounded-md" />
        <div className="space-y-3">
          <div className="h-24 bg-muted/20 rounded-xl border border-border/30" />
          <div className="h-24 bg-muted/20 rounded-xl border border-border/30" />
          <div className="h-24 bg-muted/20 rounded-xl border border-border/30" />
        </div>
      </div>
    </div>
  );
}

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BookOpen, Users, Settings, ArrowRight } from 'lucide-react';
import { InsightField } from '@/components/ui/insight-field';

export default function LandingPage() {
  return (
    <main className="flex-1 flex flex-col items-center min-h-[90vh] relative overflow-hidden">
      
      {/* Signature Insight Field Background */}
      <InsightField variant="hero" />

      <div className="w-full max-w-7xl mx-auto px-6 py-20 md:py-32 flex flex-col md:flex-row items-center justify-between gap-16 relative z-10">
        
        {/* Hero Section (Asymmetrical Left) */}
        <div className="space-y-8 max-w-2xl text-left md:w-1/2">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold text-xs uppercase tracking-widest mb-2 border border-primary/20 backdrop-blur-sm">
            LearnLens AI
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif tracking-tight text-foreground leading-[1.1]">
            See Beyond <br />the <span className="text-primary italic">Score.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground font-light leading-relaxed max-w-xl">
            Marks tell you what you scored.<br /> LearnLens helps you understand <strong className="font-semibold text-foreground">why.</strong>
          </p>
        </div>

        {/* Portals Grid (Asymmetrical Right) */}
        <div className="flex flex-col gap-6 md:w-1/2 max-w-md w-full pt-8 md:pt-0">
          
          {/* Student Portal (Primary Emphasis) */}
          <Link href="/student/dashboard" className="block group">
            <Card className="relative overflow-hidden border-primary/30 shadow-md transition-all duration-500 hover:shadow-xl hover:-translate-y-1 bg-white/80 backdrop-blur-md">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="p-8 flex items-center justify-between">
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-primary/15 rounded-2xl flex items-center justify-center mb-4 text-primary shadow-sm border border-primary/20">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-2xl font-serif text-foreground">Student Portal</CardTitle>
                  <CardDescription className="text-base text-muted-foreground">
                    Analyze assessments & discover learning patterns.
                  </CardDescription>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300 shrink-0">
                  <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <div className="grid grid-cols-2 gap-6">
            {/* Teacher Portal */}
            <Link href="/teacher/login" className="block group">
              <Card className="h-full border-border/60 shadow-sm transition-all duration-500 hover:shadow-md hover:-translate-y-1 bg-white/60 backdrop-blur-md">
                <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
                  <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center text-foreground border border-border group-hover:border-primary/30 transition-colors">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-serif text-foreground">Teacher</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">Class insights</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Admin Portal */}
            <Link href="/admin/dashboard" className="block group">
              <Card className="h-full border-border/60 shadow-sm transition-all duration-500 hover:shadow-md hover:-translate-y-1 bg-white/60 backdrop-blur-md">
                <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
                  <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center text-foreground border border-border group-hover:border-primary/30 transition-colors">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-serif text-foreground">Admin</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">Environment</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
          
        </div>
      </div>
    </main>
  );
}

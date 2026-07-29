'use client';

import { useState, useActionState } from 'react';
import Link from 'next/link';
import { BookOpen, Mail, Lock, ArrowRight, Loader2, CheckCircle2, AlertCircle, Sparkles, UserPlus, Eye, EyeOff } from 'lucide-react';
import { AmbientAuroraBackground } from '@/components/ui/ambient-aurora-background';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { teacherLogin, teacherSignup } from '@/app/actions/teacher-auth';
import { triggerHaptic } from '@/lib/haptics';

export default function TeacherLoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  const [loginState, loginAction, isLoginPending] = useActionState(teacherLogin, null);
  const [signupState, signupAction, isSignupPending] = useActionState(teacherSignup, null);

  const activeState = isLogin ? loginState : signupState;
  const isPending = isLogin ? isLoginPending : isSignupPending;

  const toggleMode = (mode: boolean) => {
    triggerHaptic('light');
    setIsLogin(mode);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-foreground relative overflow-hidden font-sans selection:bg-primary/20">
      <AmbientAuroraBackground variant="auth" />

      {/* Header */}
      <header className="p-4 md:p-6 relative z-20 max-w-6xl mx-auto w-full flex items-center justify-between">
        <Link
          href="/"
          onClick={() => triggerHaptic('light')}
          className="inline-flex items-center gap-2 text-xs md:text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors bg-white/90 border border-border/80 px-4 py-2 rounded-full backdrop-blur-xl shadow-sm"
        >
          ← Exit to Home
        </Link>
        <div className="flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-primary font-bold bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Teacher Portal</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 relative z-10 w-full max-w-md mx-auto">
        <Card className="w-full shadow-2xl shadow-primary/5 border-primary/25 bg-white/95 backdrop-blur-2xl rounded-3xl overflow-hidden">
          <CardHeader className="text-center pb-4 space-y-3">
            <div className="mx-auto w-14 h-14 bg-primary/15 rounded-2xl flex items-center justify-center text-primary shadow-inner">
              {isLogin ? <BookOpen className="w-7 h-7" /> : <UserPlus className="w-7 h-7" />}
            </div>
            <div className="space-y-1">
              <CardTitle className="text-3xl font-serif font-bold text-foreground tracking-tight">
                {isLogin ? 'Welcome Back' : 'Create Teacher Account'}
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm">
                {isLogin
                  ? 'Sign in to access your examinations and class insights'
                  : 'Register as an educator to start receiving Learning MRIs'}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pt-2">
            <form action={isLogin ? loginAction : signupAction} className="space-y-4">
              {/* High-Contrast Error Alert */}
              {activeState?.error && (
                <div className="p-3.5 text-xs md:text-sm text-red-800 bg-red-50 rounded-2xl border border-red-200 text-center flex items-center justify-center gap-2 animate-in fade-in zoom-in-95 font-medium shadow-sm">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{activeState.error}</span>
                </div>
              )}

              {/* High-Contrast Success Alert */}
              {activeState?.success && activeState?.message && (
                <div className="p-3.5 text-xs md:text-sm text-emerald-800 bg-emerald-50 rounded-2xl border border-emerald-200 text-center flex items-center justify-center gap-2 animate-in fade-in zoom-in-95 font-medium shadow-sm">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-primary" />
                  <span>{activeState.message}</span>
                </div>
              )}

              <div className="space-y-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground/60">
                    <Mail className="h-4 h-4" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Teacher Email Address"
                    required
                    className="flex h-12 w-full rounded-xl border border-border/80 bg-background/60 pl-10 pr-4 py-2 text-sm aurora-input focus-visible:outline-none placeholder:text-muted-foreground/60 transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 font-medium"
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground/60">
                    <Lock className="h-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Password"
                    required
                    minLength={6}
                    className="flex h-12 w-full rounded-xl border border-border/80 bg-background/60 pl-10 pr-12 py-2 text-sm aurora-input focus-visible:outline-none placeholder:text-muted-foreground/60 transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setShowPassword(!showPassword);
                    }}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70 hover:text-foreground transition-colors p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isPending}
                onClick={() => triggerHaptic('medium')}
                className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 mt-2"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isLogin ? 'Authenticating...' : 'Registering...'}</span>
                  </>
                ) : (
                  <>
                    <span>{isLogin ? 'Sign In to Portal' : 'Register Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 items-center justify-center border-t border-border/40 py-4 bg-muted/20">
            <div className="text-center text-xs text-muted-foreground flex flex-col sm:flex-row items-center gap-1.5">
              <span>{isLogin ? "Don't have a teacher account?" : "Already registered as a teacher?"}</span>
              
              {/* Glowing / Breathing Highlighted Register Button */}
              <button
                type="button"
                onClick={() => toggleMode(!isLogin)}
                className="inline-flex items-center gap-1.5 font-bold text-primary hover:text-primary/80 transition-all px-3 py-1 rounded-full bg-primary/10 border border-primary/30 shadow-sm animate-pulse hover:animate-none hover:scale-105 active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>{isLogin ? 'Register now' : 'Sign in instead'}</span>
              </button>
            </div>
          </CardFooter>
        </Card>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-muted-foreground/60 relative z-20 font-serif">
        LearnLens AI — Empowering Educators with Learning Diagnostics
      </footer>
    </div>
  );
}

'use client'

import { useActionState, useState } from 'react'
import { login, signup, forgotPassword } from '@/app/actions/student-auth'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, BookOpen, CheckCircle2, ArrowRight, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

import { AmbientAuroraBackground } from '@/components/ui/ambient-aurora-background'

export default function StudentLogin() {
  const [viewState, setViewState] = useState<'signin' | 'signup' | 'forgot'>('signin')
  const [showPassword, setShowPassword] = useState(false)
  
  const [loginState, loginAction, isLoginPending] = useActionState(async (state: any, formData: FormData) => {
    return await login(formData)
  }, null)

  const [signupState, signupAction, isSignupPending] = useActionState(async (state: any, formData: FormData) => {
    return await signup(formData)
  }, null)

  const [forgotState, forgotAction, isForgotPending] = useActionState(async (state: any, formData: FormData) => {
    return await forgotPassword(formData)
  }, null)

  const pending = viewState === 'signup' ? isSignupPending : viewState === 'forgot' ? isForgotPending : isLoginPending
  const activeAction = viewState === 'signup' ? signupAction : viewState === 'forgot' ? forgotAction : loginAction
  const state = viewState === 'signup' ? signupState : viewState === 'forgot' ? forgotState : loginState

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      
      {/* Living Aurora Atmospheric Background */}
      <AmbientAuroraBackground variant="auth" />

      <Card className="w-full max-w-md shadow-2xl shadow-primary/5 border-primary/25 bg-white/75 backdrop-blur-2xl relative z-10">
        <CardHeader className="text-center space-y-4 pt-8">
          <div className="relative mx-auto w-16 h-16 bg-primary/15 rounded-2xl flex items-center justify-center text-primary shadow-inner border border-primary/20">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full -z-10" />
            <BookOpen className="w-8 h-8 relative z-10" />
          </div>
          <div>
            <CardTitle className="text-3xl font-serif text-foreground">
              {viewState === 'signup' ? 'Join LearnLens' : viewState === 'forgot' ? 'Reset Password' : 'Welcome Back'}
            </CardTitle>
            <CardDescription className="text-base mt-2">
              {viewState === 'signup' 
                ? 'Create your isolated student workspace.' 
                : viewState === 'forgot' 
                  ? "We'll send you a secure link to reset it."
                  : 'Access your personal learning journey.'}
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="px-8 pb-8">
          {(state as any)?.success ? (
            <div className="space-y-6 text-center animate-in fade-in zoom-in-95">
              <div className="mx-auto w-16 h-16 bg-success/15 rounded-full flex items-center justify-center text-success">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">
                  {viewState === 'forgot' ? 'Check your inbox' : 'Verification Link Sent'}
                </h3>
                <p className="text-muted-foreground">{(state as any).message}</p>
              </div>
              <Button onClick={() => setViewState('signin')} variant="outline" className="w-full">
                Return to Sign In
              </Button>
            </div>
          ) : (
            <form action={activeAction} className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
              
              <div className="space-y-2 text-left">
                <label htmlFor="email" className="text-sm font-semibold text-foreground tracking-wide">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="flex h-12 w-full rounded-xl border border-border/60 bg-background/50 px-4 py-2 text-sm aurora-input focus-visible:outline-none placeholder:text-muted-foreground/70"
                  placeholder="student@example.com"
                />
              </div>

              {viewState !== 'forgot' && (
                <div className="space-y-2 text-left relative">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-sm font-semibold text-foreground tracking-wide">
                      Password
                    </label>
                    {viewState === 'signin' && (
                      <button type="button" onClick={() => setViewState('forgot')} className="text-xs text-primary hover:underline font-medium">
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      className="flex h-12 w-full rounded-xl border border-border/60 bg-background/50 px-4 py-2 pr-12 text-sm aurora-input focus-visible:outline-none placeholder:text-muted-foreground/70"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              )}

              {state?.error && (
                <div className="flex items-start gap-3 text-destructive bg-destructive/10 p-4 rounded-xl text-sm border border-destructive/20 animate-in fade-in slide-in-from-top-2">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{state.error}</p>
                </div>
              )}

              <Button type="submit" size="lg" className="w-full h-12 rounded-xl text-base font-semibold tracking-wide shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] transition-all group" disabled={pending}>
                {pending 
                  ? (viewState === 'signup' ? 'Creating Account...' : viewState === 'forgot' ? 'Sending...' : 'Signing In...') 
                  : (viewState === 'signup' ? 'Create Account' : viewState === 'forgot' ? 'Reset Password' : 'Sign In')}
                {!pending && <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />}
              </Button>
            </form>
          )}
        </CardContent>
        
        {!(state as any)?.success && (
          <CardFooter className="justify-center border-t border-border/40 py-6 bg-muted/30">
            <button 
              type="button"
              onClick={() => setViewState(viewState === 'signup' ? 'signin' : 'signup')} 
              className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
            >
              {viewState === 'signup' ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </CardFooter>
        )}
      </Card>
      
      {/* Return to home */}
      <Link href="/" className="absolute top-6 left-6 text-sm text-muted-foreground hover:text-foreground font-medium transition-colors bg-white/60 backdrop-blur-md px-4 py-2 rounded-full border border-border/50 shadow-sm z-20">
        ← Home
      </Link>
    </div>
  );
}

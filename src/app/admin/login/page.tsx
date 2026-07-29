"use client";

import { useActionState, useState } from 'react';
import { loginWithDemoPassword } from '@/app/actions/auth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, AlertCircle, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { triggerHaptic } from '@/lib/haptics';

export default function AdminLogin() {
  const [state, formAction, pending] = useActionState(loginWithDemoPassword, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4 font-sans">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary rounded-3xl overflow-hidden bg-white/95 backdrop-blur-2xl">
        <CardHeader className="text-center space-y-4 pt-8">
          <div className="mx-auto w-12 h-12 bg-primary/15 rounded-2xl flex items-center justify-center text-primary shadow-inner">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <CardTitle className="text-2xl font-serif font-bold text-foreground">Admin Portal</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">Enter the demo password to access.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-6 md:px-8 pb-6">
          <form action={formAction} className="space-y-6">
            <input type="hidden" name="portalType" value="admin" />
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-xs font-mono uppercase tracking-wider font-semibold text-muted-foreground">
                Passcode
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="flex h-12 w-full rounded-xl border border-border/80 bg-background/60 px-4 py-2 pr-12 text-sm aurora-input focus-visible:outline-none placeholder:text-muted-foreground/60 transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 font-medium"
                  placeholder="••••••••"
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

            {state?.error && (
              <div className="p-3.5 text-xs md:text-sm text-red-800 bg-red-50 rounded-2xl border border-red-200 text-center flex items-center justify-center gap-2 animate-in fade-in zoom-in-95 font-medium shadow-sm">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{state.error}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={pending}
              onClick={() => triggerHaptic('medium')}
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow-md shadow-primary/20 transition-all"
            >
              {pending ? 'Verifying...' : 'Access Portal'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t border-border/40 py-4 bg-muted/20">
          <Link href="/" className="text-xs font-semibold text-primary hover:underline">
            Return to Home
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

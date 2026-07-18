"use client";

import { useActionState } from 'react';
import { loginWithDemoPassword } from '@/app/actions/auth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function TeacherLogin() {
  const [state, formAction, pending] = useActionState(loginWithDemoPassword, null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <CardTitle className="text-2xl">Teacher Portal</CardTitle>
            <CardDescription>Enter the demo password to access.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-6">
            <input type="hidden" name="portalType" value="teacher" />
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Demo Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="••••••••"
              />
            </div>

            {state?.error && (
              <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-3 rounded-md text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>{state.error}</p>
              </div>
            )}

            {/* Developer Note (Only visible in UI for demo instructions) */}
            <p className="text-xs text-muted-foreground text-center">
              Developer Note: This is a demo-only gate. In Phase 3, this will be replaced with Supabase Auth.
            </p>

            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? 'Verifying...' : 'Access Portal'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t border-border pt-6">
          <Link href="/" className="text-sm text-primary hover:underline">
            Return to Home
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

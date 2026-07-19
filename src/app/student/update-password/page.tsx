'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle2, Eye, EyeOff, Lock } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export default function UpdatePassword() {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleUpdate = async () => {
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.updateUser({
      password: password
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setTimeout(() => {
        router.push('/student/dashboard')
      }, 2000)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <Card className="w-full max-w-md shadow-2xl border-primary/20 bg-white/70 backdrop-blur-xl relative z-10">
        <CardHeader className="text-center space-y-4 pt-8">
          <div className="mx-auto w-16 h-16 bg-primary/15 rounded-2xl flex items-center justify-center text-primary shadow-inner border border-primary/20">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <CardTitle className="text-3xl font-serif text-foreground">
              New Password
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Please enter your new password below.
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="px-8 pb-8">
          {success ? (
            <div className="space-y-6 text-center animate-in fade-in zoom-in-95">
              <div className="mx-auto w-16 h-16 bg-success/15 rounded-full flex items-center justify-center text-success">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">Password Updated</h3>
                <p className="text-muted-foreground">Redirecting to your dashboard...</p>
              </div>
            </div>
          ) : (
            <div 
              className="space-y-5" 
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleUpdate();
              }}
            >
              <div className="space-y-2 text-left relative">
                <label htmlFor="password" className="text-sm font-semibold text-foreground tracking-wide">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex h-12 w-full rounded-xl border border-border/60 bg-background/50 px-4 py-2 pr-12 text-sm transition-colors focus-visible:outline-none focus-visible:border-primary/50 focus-visible:ring-4 focus-visible:ring-primary/10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-3 text-destructive bg-destructive/10 p-4 rounded-xl text-sm border border-destructive/20 animate-in fade-in slide-in-from-top-2">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{error}</p>
                </div>
              )}

              <Button type="button" onClick={handleUpdate} size="lg" className="w-full h-12 rounded-xl text-base font-semibold tracking-wide" disabled={loading}>
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

const RATE_LIMIT_MESSAGE = "We've reached the temporary email sending limit. Please wait a few minutes and try again."

function isRateLimit(error: any) {
  const msg = error?.message?.toLowerCase() || ''
  return msg.includes('rate limit') || msg.includes('too many requests') || error?.status === 429
}

function getSiteUrl() {
  let url = process.env.NEXT_PUBLIC_SITE_URL || 
            process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL || 
            process.env.NEXT_PUBLIC_VERCEL_URL || 
            'http://localhost:3000';
  url = url.startsWith('http') ? url : `https://${url}`;
  return url;
}

export async function login(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/student/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { data: signUpData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${getSiteUrl()}/auth/callback?next=/student/login`,
    },
  })

  if (error) {
    if (isRateLimit(error)) {
      return { error: RATE_LIMIT_MESSAGE }
    }
    return { error: error.message }
  }

  // DEV BYPASS: Auto-confirm users locally only
  if (
    process.env.NODE_ENV === 'development' &&
    process.env.AUTH_DEV_BYPASS === 'true' &&
    signUpData?.user
  ) {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const adminClient = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      )

      await adminClient.auth.admin.updateUserById(
        signUpData.user.id,
        { email_confirm: true }
      )

      return {
        success: true,
        message:
          'DEV BYPASS: Account auto-confirmed. You can log in immediately.',
      }
    }
  }

  return {
    success: true,
    message: 'Check your email to continue the sign in process.',
  }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

export async function forgotPassword(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string

  // DEV BYPASS: Generate recovery link and print to console instead of sending email
  if (
    process.env.NODE_ENV === 'development' &&
    process.env.AUTH_DEV_BYPASS === 'true'
  ) {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const adminClient = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      )

      const { data } = await adminClient.auth.admin.generateLink({
        type: 'recovery',
        email,
      })

      if (data?.properties?.action_link) {
        console.log('\n\n======================================================')
        console.log('🚧 DEV BYPASS RECOVERY LINK 🚧')
        console.log(data.properties.action_link)
        console.log('======================================================\n\n')

        return {
          success: true,
          message: 'DEV BYPASS: Check your terminal console for the recovery link.',
        }
      }
    }
  }

  // Production password recovery through Supabase + Resend
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getSiteUrl()}/auth/callback?next=/student/update-password`,
  })

  if (error) {
    if (isRateLimit(error)) {
      return { error: RATE_LIMIT_MESSAGE }
    }

    return { error: error.message }
  }

  return {
    success: true,
    message: 'Check your inbox for the password reset link.',
  }
}
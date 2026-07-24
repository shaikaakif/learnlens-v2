import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Safely get user and error status
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  // Helper to construct redirect response preserving Supabase cookies (e.g. token refresh or deletions)
  const createRedirectResponse = (url: URL) => {
    const redirectResponse = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
    })
    return redirectResponse
  }

  // Clear stale auth cookies when refresh token is invalid or expired
  if (error && !user) {
    request.cookies.getAll().forEach((cookie) => {
      if (cookie.name.startsWith('sb-')) {
        supabaseResponse.cookies.delete(cookie.name)
      }
    })
  }

  // Protect student routes
  if (
    request.nextUrl.pathname.startsWith('/student') && 
    !request.nextUrl.pathname.startsWith('/student/login') &&
    !request.nextUrl.pathname.startsWith('/student/update-password')
  ) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/student/login'
      return createRedirectResponse(url)
    }
  }

  // Redirect from root or login to dashboard if already logged in
  if ((request.nextUrl.pathname === '/' || request.nextUrl.pathname === '/student/login') && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/student/dashboard'
    return createRedirectResponse(url)
  }

  return supabaseResponse
}

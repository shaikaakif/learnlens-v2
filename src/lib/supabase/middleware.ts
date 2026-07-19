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

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with cross-site request forgery (CSRF).
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect student routes
  if (
    request.nextUrl.pathname.startsWith('/student') && 
    !request.nextUrl.pathname.startsWith('/student/login') &&
    !request.nextUrl.pathname.startsWith('/student/update-password')
  ) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/student/login'
      return NextResponse.redirect(url)
    }
  }

  // Redirect from root or login to dashboard if already logged in
  if ((request.nextUrl.pathname === '/' || request.nextUrl.pathname === '/student/login') && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/student/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

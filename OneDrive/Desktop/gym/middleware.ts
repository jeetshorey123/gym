import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  // For local development, we'll skip Supabase auth and use simple routing
  const { pathname } = request.nextUrl

  // Allow login page access
  if (pathname === '/login') {
    return NextResponse.next()
  }

  // For dashboard and other protected routes, we'll rely on client-side auth
  // In a real app, you'd verify the session here
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
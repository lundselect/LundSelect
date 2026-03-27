import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow the survey page, admin dashboard, and API routes
  if (
    pathname === '/pesquisa' ||
    pathname.startsWith('/admin/pesquisa') ||
    pathname.startsWith('/api/pesquisa') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/icons') ||
    pathname === '/sw.js' ||
    pathname === '/manifest.json' ||
    pathname.match(/\.(png|jpg|jpeg|svg|ico|webp|css|js)$/)
  ) {
    return NextResponse.next()
  }

  // Redirect everything else to the survey
  return NextResponse.redirect(new URL('/pesquisa', req.url))
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

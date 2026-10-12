import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const secretKey = process.env.SESSION_SECRET
if (!secretKey) {
  console.warn('[proxy] SESSION_SECRET not set — auth protection disabled')
}
const encodedKey = new TextEncoder().encode(secretKey ?? '')

const PUBLIC_ROUTES = ['/login', '/register']

async function isValidSession(token: string | undefined) {
  if (!token || !secretKey) return false
  try {
    await jwtVerify(token, encodedKey, { algorithms: ['HS256'] })
    return true
  } catch {
    return false
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('session')?.value
  const isLoggedIn = await isValidSession(token)

  const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route))

  if (isPublic && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (!isPublic && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
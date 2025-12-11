import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// Next.js 16+ convention: 'proxy.ts' instead of 'middleware.ts'
export async function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname

    // 1. Determine which cookie is present
    // NextAuth v5 uses 'authjs.session-token' or '__Secure-authjs.session-token'
    // NextAuth v4 uses 'next-auth.session-token' or '__Secure-next-auth.session-token'
    const cookieName = request.cookies.get('__Secure-authjs.session-token')
        ? '__Secure-authjs.session-token'
        : request.cookies.get('authjs.session-token')
            ? 'authjs.session-token'
            : request.cookies.get('__Secure-next-auth.session-token')
                ? '__Secure-next-auth.session-token'
                : 'next-auth.session-token'

    console.log('[Middleware] Checking path:', pathname)
    console.log('[Middleware] Using Cookie Name:', cookieName)

    try {
        const token = await getToken({
            req: request,
            secret: process.env.NEXTAUTH_SECRET,
            cookieName: cookieName
        })

        console.log('[Middleware] Token found:', !!token)
        if (token) {
            console.log('[Middleware] User:', token.email)
        } else {
            // Detailed failure log
            console.log('[Middleware] Decryption failed or token missing.')
            console.log('[Middleware] Secret available:', !!process.env.NEXTAUTH_SECRET)
        }

        const isAdminRoute = pathname.startsWith('/admin')
        const isLoginPage = pathname === '/admin/login'
        const isApiAuthRoute = pathname.startsWith('/api/auth')

        // Allow API auth routes
        if (isApiAuthRoute) {
            return NextResponse.next()
        }

        // Redirect to login if accessing protected admin routes without token
        if (isAdminRoute && !token && !isLoginPage) {
            console.log('[Middleware] Redirecting to login (No token)')
            return NextResponse.redirect(new URL('/admin/login', request.url))
        }

        // Redirect to admin dashboard if logged in and trying to access login page
        if (isLoginPage && token) {
            console.log('[Middleware] Redirecting to dashboard (Already logged in)')
            return NextResponse.redirect(new URL('/admin', request.url))
        }

        return NextResponse.next()
    } catch (error) {
        console.error('[Middleware] Error:', error)
        return NextResponse.next()
    }
}

// Ensure default export is also provided if supported/required
export default proxy

export const config = {
    matcher: ['/admin/:path*'],
}

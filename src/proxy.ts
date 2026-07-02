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
            secret: process.env.AUTH_SECRET,
            cookieName: cookieName
        })

        console.log('[Middleware] Token found:', !!token)
        if (token) {
            console.log('[Middleware] User:', token.email)
        } else {
            // Detailed failure log
            console.log('[Middleware] Decryption failed or token missing.')
            console.log('[Middleware] Secret available:', !!process.env.AUTH_SECRET)
        }

        const isAdminRoute = pathname.startsWith('/admin')
        const isLoginPage = pathname === '/admin/login'
        const isPublicAdminRoute =
            pathname === '/admin/login' ||
            pathname === '/admin/forgot-password' ||
            pathname === '/admin/reset-password'

        const isApiAuthRoute = pathname.startsWith('/api/auth')

        // Allow API auth routes
        if (isApiAuthRoute) {
            return NextResponse.next()
        }

        // Redirect to login if accessing protected admin routes without token
        if (isAdminRoute && !token && !isPublicAdminRoute) {
            console.log('[Middleware] Redirecting to login (No token)')
            return NextResponse.redirect(new URL('/admin/login', request.url))
        }

        // Redirect to admin dashboard if logged in and trying to access public admin pages (login/forgot/reset)
        if (isPublicAdminRoute && token) {
            console.log('[Middleware] Redirecting to dashboard (Already logged in)')
            return NextResponse.redirect(new URL('/admin', request.url))
        }

        // Create response with security headers
        const response = NextResponse.next()

        // 1. Strict Transport Security (HSTS)
        // Force HTTPS for 2 years, include subdomains, allow preload
        response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')

        // 2. X-Frame-Options (Clickjacking protection)
        response.headers.set('X-Frame-Options', 'DENY')

        // 3. X-Content-Type-Options (MIME-sniffing protection)
        response.headers.set('X-Content-Type-Options', 'nosniff')

        // 4. Referrer Policy
        response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

        // 5. Permisson Policy (Disable unused features)
        response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

        // 6. Content Security Policy (CSP)
        response.headers.set(
            'Content-Security-Policy',
            [
                "default-src 'self'",
                "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://unpkg.com https://www.googletagmanager.com",
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                "font-src 'self' https://fonts.gstatic.com",
                "img-src 'self' data: https: blob: https://www.google-analytics.com",
                "connect-src 'self' https://res.cloudinary.com https://www.google-analytics.com https://analytics.google.com https://geocoding-api.open-meteo.com",
                "frame-src 'self' https://www.google.com https://maps.google.com",
                "frame-ancestors 'none'",
                "object-src 'none'",
                "base-uri 'self'",
                "form-action 'self'",
            ].join('; ')
        )

        return response
    } catch (error) {
        console.error('[Middleware] Error:', error)
        return NextResponse.next()
    }
}

// Ensure default export is also provided if supported/required
export default proxy

export const config = {
    // Match all request paths except for the ones starting with:
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

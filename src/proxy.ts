import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// Next.js 16+ convention: 'proxy.ts' instead of 'middleware.ts'
export async function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname
    console.log('[Middleware] Checking path:', pathname)

    try {
        const token = await getToken({
            req: request,
            secret: process.env.NEXTAUTH_SECRET
        })

        // Debugging Cookie Issues
        console.log('[Middleware] NODE_ENV:', process.env.NODE_ENV)
        console.log('[Middleware] Secret configured:', process.env.NEXTAUTH_SECRET ? 'YES' : 'NO')
        console.log('[Middleware] Cookies:', request.cookies.getAll().map(c => c.name).join(', '))

        console.log('[Middleware] Token found:', !!token)
        if (token) {
            console.log('[Middleware] User:', token.email)
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

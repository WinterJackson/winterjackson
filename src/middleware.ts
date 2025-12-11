import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET
    })

    const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
    const isLoginPage = request.nextUrl.pathname === '/admin/login'
    const isApiAuthRoute = request.nextUrl.pathname.startsWith('/api/auth')

    // Allow API auth routes
    if (isApiAuthRoute) {
        return NextResponse.next()
    }

    // Redirect to login if accessing admin routes without auth
    if (isAdminRoute && !token && !isLoginPage) {
        return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // Redirect to admin dashboard if logged in and accessing login page
    if (isLoginPage && token) {
        return NextResponse.redirect(new URL('/admin', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/admin/:path*'],
}


import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const token = searchParams.get('token')
        const email = searchParams.get('email')

        if (!token || !email) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const user = await prisma.user.findUnique({
            where: { email },
        })

        if (!user || !user.resetToken || !user.resetTokenExpiry) {
            // Token invalid or doesn't exist
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
        }

        // Check expiry
        if (new Date() > user.resetTokenExpiry) {
            // Token Expired
            return NextResponse.json({ error: 'Token has expired' }, { status: 400 })
        }

        // Verify token hash
        const isValidToken = await bcrypt.compare(token, user.resetToken)

        if (!isValidToken) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
        }

        return NextResponse.json({ message: 'Token is valid' })

    } catch (error) {
        console.error('Validate Token Error:', error)
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const { token, email, password } = await req.json()

        if (!token || !email || !password) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const user = await prisma.user.findUnique({
            where: { email },
        })

        if (!user || !user.resetToken || !user.resetTokenExpiry) {
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
        }

        // Check expiry
        if (new Date() > user.resetTokenExpiry) {
            return NextResponse.json({ error: 'Token has expired' }, { status: 400 })
        }

        // Verify token hash
        const isValidToken = await bcrypt.compare(token, user.resetToken)

        if (!isValidToken) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 12)

        // Update user
        await prisma.user.update({
            where: { email },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null,
            },
        })

        return NextResponse.json({ message: 'Password reset successfully' })

    } catch (error) {
        console.error('Reset Password Error:', error)
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
    }
}

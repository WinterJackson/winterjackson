
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
    try {
        const { email } = await req.json()

        const user = await prisma.user.findUnique({
            where: { email },
        })

        if (!user) {
            // Return success even if user not found to prevent enumeration
            // But in a real admin panel, we might want to be more explicit if internal
            // Staying secure:
            return NextResponse.json({ message: 'If that email exists, a reset link has been sent.' })
        }

        // Generate token
        const resetToken = crypto.randomBytes(32).toString('hex')
        const resetTokenHash = await bcrypt.hash(resetToken, 10)

        // Set expiry (1 hour)
        const resetTokenExpiry = new Date(Date.now() + 3600000)

        await prisma.user.update({
            where: { email },
            data: {
                resetToken: resetTokenHash,
                resetTokenExpiry,
            },
        })

        // Construct Link
        // Robust Base URL logic:
        // 1. NEXTAUTH_URL (Manual override, safest)
        // 2. VERCEL_URL (Automatic on Vercel deployments - requires https:// prefix)
        // 3. Localhost fallback
        let baseUrl = process.env.NEXTAUTH_URL
        if (!baseUrl && process.env.VERCEL_URL) {
            baseUrl = `https://${process.env.VERCEL_URL}`
        }
        if (!baseUrl) {
            baseUrl = 'http://localhost:3000'
        }

        const resetUrl = `${baseUrl}/admin/reset-password?token=${resetToken}&email=${email}`

        // Send Email
        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: 'Password Reset Request - Winter Jackson Portfolio',
            html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
        .header { background: #18181b; padding: 30px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; letter-spacing: -0.5px; }
        .content { padding: 40px 30px; color: #3f3f46; line-height: 1.6; }
        .button { display: inline-block; background-color: #000000; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 500; margin: 20px 0; }
        .footer { background: #fafafa; padding: 20px; text-align: center; color: #71717a; font-size: 12px; }
        .link { color: #2563eb; word-break: break-all; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Password Recovery</h1>
        </div>
        <div class="content">
            <h2 style="margin-top: 0; color: #18181b;">Hello,</h2>
            <p>We received a request to reset the password for your <strong>Winter Jackson Portfolio</strong> admin account.</p>
            <p>Click the button below to set a new password. This link is secure and valid for <strong>1 hour</strong>.</p>
            
            <div style="text-align: center;">
                <a href="${resetUrl}" class="button" target="_blank">Reset Password</a>
            </div>
            
            <p>If you didn't request this change, you can safely ignore this email.</p>
            
            <hr style="border: 0; border-top: 1px solid #e4e4e7; margin: 30px 0;">
            
            <p style="font-size: 13px; color: #71717a;">Or copy and paste this link into your browser:</p>
            <a href="${resetUrl}" class="link">${resetUrl}</a>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Winter Jackson. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
      `
        })

        if (error) {
            console.error('Resend Error:', error)
            return NextResponse.json({ error: 'Failed to send reset email' }, { status: 500 })
        }

        return NextResponse.json({ message: 'If that email exists, a reset link has been sent.' })

    } catch (error) {
        console.error('Forgot Password Error:', error)
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
    }
}

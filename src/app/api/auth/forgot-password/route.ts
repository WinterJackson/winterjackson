
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
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Recovery</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f5; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); overflow: hidden;">
                    <!-- Header -->
                    <tr>
                        <td align="center" style="background-color: #18181b; padding: 30px 20px;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">Password Recovery</h1>
                            <p style="color: #a1a1aa; margin: 8px 0 0 0; font-size: 14px;">Security alert for your admin dashboard.</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 16px 0; color: #18181b; font-size: 18px; font-weight: 600;">Hello,</h2>
                            <p style="margin: 0 0 16px 0; color: #52525b; font-size: 15px; line-height: 1.6;">
                                We received a request to reset the password for your <strong>Winter Jackson Portfolio</strong> admin account.
                            </p>
                            <p style="margin: 0 0 30px 0; color: #52525b; font-size: 15px; line-height: 1.6;">
                                Click the button below to set a new password. This link is secure and valid for <strong>1 hour</strong>.
                            </p>
                            
                            <!-- Action Button -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center">
                                        <a href="${resetUrl}" target="_blank" style="display: inline-block; background-color: #18181b; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 500; padding: 14px 32px; border-radius: 6px; border: 1px solid #18181b;">
                                            Reset Password
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 30px 0 0 0; color: #71717a; font-size: 14px; text-align: center;">
                                If you didn't request this change, you can safely ignore this email.
                            </p>
                            
                            <hr style="border: 0; border-top: 1px solid #e4e4e7; margin: 30px 0;">
                            
                            <p style="margin: 0 0 8px 0; color: #71717a; font-size: 13px; text-align: center;">
                                Or copy and paste this link into your browser:
                            </p>
                            <div style="text-align: center; word-break: break-all;">
                                <a href="${resetUrl}" style="color: #2563eb; font-size: 13px;">${resetUrl}</a>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td align="center" style="background-color: #fafafa; border-top: 1px solid #f4f4f5; padding: 24px 20px;">
                            <p style="margin: 0; color: #a1a1aa; font-size: 12px; line-height: 1.5;">
                                This is an automated security message from your portfolio.<br>
                                &copy; ${new Date().getFullYear()} Winter Jackson
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
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

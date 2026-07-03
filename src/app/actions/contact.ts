'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { Resend } from 'resend'

const ContactSchema = z.object({
    fullname: z.string().min(2, 'Name is too short'),
    email: z.string().email('Invalid email address'),
    message: z.string().min(10, 'Message must be at least 10 characters'),
    honeypot: z.string().optional()
})

type ContactFormData = z.infer<typeof ContactSchema>

import { headers } from 'next/headers'

const rateLimitMap = new Map<string, { count: number, timestamp: number }>()
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes
const MAX_REQUESTS = 5

export async function submitContactMessage(formData: ContactFormData | unknown) {
    const result = ContactSchema.safeParse(formData)

    if (!result.success) {
        return { success: false, error: result.error.issues[0].message }
    }

    try {
        const { fullname, email, message, honeypot } = result.data

        // 1. Honeypot check (bot prevention)
        if (honeypot) {
            // Silently succeed for bots
            return { success: true }
        }

        // 2. IP Rate Limiting
        const headersList = await headers()
        const ip = headersList.get('x-forwarded-for') || 'anonymous'
        
        const now = Date.now()
        const userLimit = rateLimitMap.get(ip)

        if (userLimit && now - userLimit.timestamp < RATE_LIMIT_WINDOW) {
            if (userLimit.count >= MAX_REQUESTS) {
                return { success: false, error: 'Too many requests. Please try again later.' }
            }
            userLimit.count += 1
        } else {
            rateLimitMap.set(ip, { count: 1, timestamp: now })
        }

        // Clean up old entries periodically (simple garbage collection)
        if (rateLimitMap.size > 1000) {
            const expireThreshold = now - RATE_LIMIT_WINDOW
            for (const [key, val] of rateLimitMap.entries()) {
                if (val.timestamp < expireThreshold) {
                    rateLimitMap.delete(key)
                }
            }
        }

        await prisma.message.create({
            data: {
                name: fullname,
                email,
                message
            }
        })

        // Fetch the admin's contact email to send the notification to
        const siteSettings = await prisma.siteSettings.findFirst()
        const adminEmail = siteSettings?.contactEmail || process.env.ADMIN_EMAIL || 'winterjacksonwj@gmail.com'

        // Send Email Notification via Resend
        const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Portfolio Lead</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f5; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); overflow: hidden;">
                    <!-- Header -->
                    <tr>
                        <td align="center" style="background-color: #18181b; padding: 30px 20px;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">New Client Inquiry</h1>
                            <p style="color: #a1a1aa; margin: 8px 0 0 0; font-size: 14px;">You have a new message from your portfolio website.</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <!-- Sender Details -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 30px;">
                                <tr>
                                    <td width="50" valign="top">
                                        <div style="width: 40px; height: 40px; border-radius: 20px; background-color: #f4f4f5; border: 1px solid #e4e4e7; display: inline-block; text-align: center; line-height: 40px; font-weight: bold; color: #18181b; font-size: 16px;">
                                            ${fullname.charAt(0).toUpperCase()}
                                        </div>
                                    </td>
                                    <td valign="top" style="padding-left: 15px;">
                                        <h2 style="margin: 0 0 4px 0; font-size: 18px; color: #18181b; font-weight: 600;">${fullname}</h2>
                                        <a href="mailto:${email}" style="color: #2563eb; text-decoration: none; font-size: 14px; font-weight: 500;">${email}</a>
                                    </td>
                                </tr>
                            </table>

                            <!-- Message Body -->
                            <div style="background-color: #fafafa; border: 1px solid #f4f4f5; border-radius: 8px; padding: 24px;">
                                <p style="margin: 0; color: #52525b; font-size: 11px; text-transform: uppercase; letter-spacing: 1.2px; font-weight: 600; margin-bottom: 12px;">Message</p>
                                <div style="color: #27272a; font-size: 15px; line-height: 1.6; white-space: pre-wrap; font-family: inherit;">${message}</div>
                            </div>
                            
                            <!-- Action Button -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 35px;">
                                <tr>
                                    <td align="center">
                                        <a href="mailto:${email}?subject=Following up on your Inquiry" style="display: inline-block; background-color: #18181b; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 500; padding: 12px 28px; border-radius: 6px; border: 1px solid #18181b;">
                                            Reply to ${fullname.split(' ')[0]}
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td align="center" style="background-color: #fafafa; border-top: 1px solid #f4f4f5; padding: 24px 20px;">
                            <p style="margin: 0; color: #a1a1aa; font-size: 12px; line-height: 1.5;">
                                This email was securely routed from your professional portfolio.<br>
                                &copy; ${new Date().getFullYear()} Winter Jackson
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`

        // Send Email Notification via Resend (Strictly Enforced)
        if (process.env.RESEND_API_KEY) {
            console.log('RESEND_API_KEY is present. Attempting to send email to:', adminEmail)
            const resend = new Resend(process.env.RESEND_API_KEY)
            const { data, error } = await resend.emails.send({
                from: 'Portfolio Contact <onboarding@resend.dev>',
                to: adminEmail,
                replyTo: email,
                subject: `New Lead from Portfolio: ${fullname}`,
                html: htmlTemplate
            })
            
            if (error) {
                console.error('RESEND API ERROR:', error)
            } else {
                console.log('RESEND SUCCESS: Email sent! ID:', data?.id)
            }
        } else {
            console.error('CRITICAL ERROR: RESEND_API_KEY is missing in your .env file. Email could not be sent.')
        }

        revalidatePath('/admin') // Update Dashboard Inbox Count
        return { success: true }
    } catch (error) {
        console.error('Contact submission error:', error)
        return { success: false, error: 'Failed to send message. Please try again.' }
    }
}

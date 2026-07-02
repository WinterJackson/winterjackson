'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

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

        revalidatePath('/admin') // Update Dashboard Inbox Count
        return { success: true }
    } catch (error) {
        console.error('Contact submission error:', error)
        return { success: false, error: 'Failed to send message. Please try again.' }
    }
}

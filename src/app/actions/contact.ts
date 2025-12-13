'use server'

import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const ContactSchema = z.object({
    fullname: z.string().min(2, 'Name is too short'),
    email: z.string().email('Invalid email address'),
    message: z.string().min(10, 'Message must be at least 10 characters')
})

type ContactFormData = z.infer<typeof ContactSchema>

export async function submitContactMessage(formData: ContactFormData | unknown) {
    const result = ContactSchema.safeParse(formData)

    if (!result.success) {
        return { success: false, error: result.error.issues[0].message }
    }

    try {
        const { fullname, email, message } = result.data

        await prisma.message.create({
            data: {
                name: fullname,
                email,
                message
            }
        })

        return { success: true }
    } catch (error) {
        console.error('Contact submission error:', error)
        return { success: false, error: 'Failed to send message. Please try again.' }
    }
}

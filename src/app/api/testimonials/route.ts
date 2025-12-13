import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { TestimonialSchema } from '@/lib/schemas'
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const testimonials = await prisma.testimonial.findMany({
            orderBy: { createdAt: 'desc' },
        })
        return NextResponse.json(testimonials)
    } catch (error) {
        console.error('Failed to fetch testimonials:', error)
        return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const validatedData = TestimonialSchema.parse(body)

        const testimonial = await prisma.testimonial.create({
            data: {
                ...validatedData,
                isActive: validatedData.isActive ?? true,
            },
        })

        revalidatePath('/')

        return NextResponse.json(testimonial, { status: 201 })
    } catch (error) {
        console.error('Failed to create testimonial:', error)
        return NextResponse.json({ error: 'Failed to create testimonial' }, { status: 500 })
    }
}

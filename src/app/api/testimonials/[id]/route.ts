import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { TestimonialSchema } from '@/lib/schemas'
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const testimonial = await prisma.testimonial.findUnique({
            where: { id },
        })

        if (!testimonial) {
            return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 })
        }

        return NextResponse.json(testimonial)
    } catch (error) {
        console.error('Failed to fetch testimonial:', error)
        return NextResponse.json({ error: 'Failed to fetch testimonial' }, { status: 500 })
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const body = await request.json()
        const validatedData = TestimonialSchema.parse(body)

        const testimonial = await prisma.testimonial.update({
            where: { id },
            data: validatedData,
        })

        revalidatePath('/')
        revalidatePath('/admin')

        return NextResponse.json(testimonial)
    } catch (error) {
        console.error('Failed to update testimonial:', error)
        return NextResponse.json({ error: 'Failed to update testimonial' }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        await prisma.testimonial.delete({
            where: { id },
        })

        revalidatePath('/')
        revalidatePath('/admin')

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Failed to delete testimonial:', error)
        return NextResponse.json({ error: 'Failed to delete testimonial' }, { status: 500 })
    }
}

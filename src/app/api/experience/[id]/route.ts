import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ExperienceSchema } from '@/lib/schemas'
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import { z } from 'zod'

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
        const validatedData = ExperienceSchema.parse(body)

        const experience = await prisma.experience.update({
            where: { id },
            data: validatedData,
        })

        revalidatePath('/')
        revalidatePath('/admin')

        return NextResponse.json(experience)
    } catch (error) {
        console.error('Failed to update experience:', error)
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues[0]?.message || 'Invalid input' }, { status: 400 })
        }
        return NextResponse.json({ error: 'Failed to update experience' }, { status: 500 })
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
        await prisma.experience.delete({
            where: { id },
        })

        revalidatePath('/')
        revalidatePath('/admin')

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Failed to delete experience:', error)
        return NextResponse.json({ error: 'Failed to delete experience' }, { status: 500 })
    }
}

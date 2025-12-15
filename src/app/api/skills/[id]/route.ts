import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

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
        const { name, percentage, category, iconUrl, order } = body

        const skill = await prisma.skill.update({
            where: { id },
            data: { name, percentage, category, iconUrl, order },
        })

        revalidatePath('/')
        revalidatePath('/admin')

        return NextResponse.json(skill)
    } catch (error) {
        console.error('Failed to update skill:', error)
        return NextResponse.json({ error: 'Failed to update skill' }, { status: 500 })
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
        await prisma.skill.delete({
            where: { id },
        })

        revalidatePath('/')
        revalidatePath('/admin')

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Failed to delete skill:', error)
        return NextResponse.json({ error: 'Failed to delete skill' }, { status: 500 })
    }
}

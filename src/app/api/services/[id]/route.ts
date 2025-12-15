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
        const { title, description, iconUrl, order } = body

        const service = await prisma.service.update({
            where: { id },
            data: { title, description, iconUrl, order },
        })

        revalidatePath('/')
        revalidatePath('/admin')

        return NextResponse.json(service)
    } catch (error) {
        console.error('Failed to update service:', error)
        return NextResponse.json({ error: 'Failed to update service' }, { status: 500 })
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
        await prisma.service.delete({
            where: { id },
        })

        revalidatePath('/')
        revalidatePath('/admin')

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Failed to delete service:', error)
        return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 })
    }
}

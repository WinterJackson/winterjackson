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
        const { institution, degree, field, startDate, endDate, order } = body

        const education = await prisma.education.update({
            where: { id },
            data: { institution, degree, field, startDate, endDate, order },
        })

        revalidatePath('/')

        return NextResponse.json(education)
    } catch (error) {
        console.error('Failed to update education:', error)
        return NextResponse.json({ error: 'Failed to update education' }, { status: 500 })
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
        await prisma.education.delete({
            where: { id },
        })

        revalidatePath('/')

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Failed to delete education:', error)
        return NextResponse.json({ error: 'Failed to delete education' }, { status: 500 })
    }
}

import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { EducationSchema } from '@/lib/schemas'
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const educations = await prisma.education.findMany({
            orderBy: { order: 'asc' },
        })
        return NextResponse.json(educations)
    } catch (error) {
        console.error('Failed to fetch education:', error)
        return NextResponse.json({ error: 'Failed to fetch education' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const result = EducationSchema.safeParse(body)

        if (!result.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: result.error.flatten() },
                { status: 400 }
            )
        }

        const education = await prisma.education.create({
            data: result.data,
        })

        revalidatePath('/')

        return NextResponse.json(education, { status: 201 })
    } catch (error) {
        console.error('Failed to create education:', error)
        return NextResponse.json({ error: 'Failed to create education' }, { status: 500 })
    }
}

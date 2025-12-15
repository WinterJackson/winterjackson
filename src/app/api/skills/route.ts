import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { SkillSchema } from '@/lib/schemas'
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const skills = await prisma.skill.findMany({
            orderBy: { order: 'asc' },
        })
        return NextResponse.json(skills)
    } catch (error) {
        console.error('Failed to fetch skills:', error)
        return NextResponse.json({ error: 'Failed to fetch skills' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const result = SkillSchema.safeParse(body)

        if (!result.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: result.error.flatten() },
                { status: 400 }
            )
        }

        const skill = await prisma.skill.create({
            data: result.data,
        })

        revalidatePath('/')
        revalidatePath('/admin')

        return NextResponse.json(skill, { status: 201 })
    } catch (error) {
        console.error('Failed to create skill:', error)
        return NextResponse.json({ error: 'Failed to create skill' }, { status: 500 })
    }
}

import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { ProfileSchema } from '@/lib/schemas'
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const profile = await prisma.profile.findFirst()
        return NextResponse.json(profile)
    } catch (error) {
        console.error('Failed to fetch profile:', error)
        return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()

        // Validate with Zod
        const result = ProfileSchema.safeParse(body)
        if (!result.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: result.error.flatten() },
                { status: 400 }
            )
        }

        const { name, title, email, phone, altPhone, location, bio, avatarUrl, profileVideoUrl, github, linkedin, whatsapp, cvUrl } = result.data

        const profile = await prisma.profile.upsert({
            where: { id: 'default-profile' },
            update: {
                name, title, email, phone, altPhone, location, bio, avatarUrl, profileVideoUrl, github, linkedin, whatsapp, cvUrl
            },
            create: {
                id: 'default-profile',
                name, title, email, phone, altPhone, location, bio, avatarUrl, profileVideoUrl, github, linkedin, whatsapp, cvUrl
            }
        })

        revalidatePath('/')

        return NextResponse.json(profile)
    } catch (error) {
        console.error('Failed to update profile:', error)
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }
}

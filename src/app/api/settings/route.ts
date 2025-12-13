import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { SiteSettingsSchema } from '@/lib/schemas'
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const settings = await prisma.siteSettings.findFirst()
        return NextResponse.json(settings || {})
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
    }
}

export async function PUT(req: Request) {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const validatedData = SiteSettingsSchema.parse(body)

        // Upsert ensuring only one record exists
        const firstSetting = await prisma.siteSettings.findFirst()

        const settings = await prisma.siteSettings.upsert({
            where: { id: firstSetting?.id || 'default-id' },
            create: validatedData,
            update: validatedData
        })

        revalidatePath('/')

        return NextResponse.json(settings)
    } catch (error) {
        console.error("Settings update error:", error)
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
    }
}

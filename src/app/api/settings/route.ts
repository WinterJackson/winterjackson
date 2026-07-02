import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SiteSettingsSchema } from '@/lib/schemas'
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const settings = await prisma.siteSettings.findFirst()
        
        if (!settings) return NextResponse.json({})

        const session = await auth()
        if (session) {
            return NextResponse.json(settings)
        }

        // Public fields only
        return NextResponse.json({
            maintenanceMode: settings.maintenanceMode,
            siteUrl: settings.siteUrl,
            metaTitle: settings.metaTitle,
            metaDescription: settings.metaDescription,
            metaKeywords: settings.metaKeywords,
            ogImageUrl: settings.ogImageUrl,
            showResumeDownload: settings.showResumeDownload,
            logoUrl: settings.logoUrl,
            footerText: settings.footerText,
            showTestimonials: settings.showTestimonials,
            showProjects: settings.showProjects,
            showServices: settings.showServices,
            primaryColor: settings.primaryColor,
            googleAnalyticsId: settings.googleAnalyticsId, // Needed for frontend injection
        })
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

        const settings = await prisma.siteSettings.upsert({
            where: { id: 'singleton' },
            create: { id: 'singleton', ...validatedData },
            update: validatedData
        })

        revalidatePath('/')

        return NextResponse.json(settings)
    } catch (error) {
        console.error("Settings update error:", error)
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
    }
}

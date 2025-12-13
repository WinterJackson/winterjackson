'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getDashboardStats() {
    const session = await auth()
    if (!session) throw new Error('Unauthorized')

    const [
        projectsCount,
        testimonialsCount,
        skillsCount,
        activeServicesCount,
        activeClientsCount,
        messagesCount
    ] = await Promise.all([
        prisma.project.count(),
        prisma.testimonial.count(),
        prisma.skill.count(),
        prisma.service.count(),
        prisma.client.count({ where: { isActive: true } }),
        prisma.message.count({ where: { isRead: false } })
    ])

    return {
        projects: projectsCount,
        testimonials: testimonialsCount,
        skills: skillsCount,
        services: activeServicesCount,
        clients: activeClientsCount,
        unreadMessages: messagesCount
    }
}

export async function getProfileHealth() {
    const session = await auth()
    if (!session) throw new Error('Unauthorized')

    const profile = await prisma.profile.findFirst()
    if (!profile) return 0

    const fieldsToCheck = [
        'avatarUrl',
        'bio',
        'github',
        'linkedin',
        'cvUrl',
        'title',
        'location'
    ]

    let completed = 0
    fieldsToCheck.forEach(field => {
        // @ts-ignore
        if (profile[field] && profile[field].length > 0) {
            completed++
        }
    })

    return Math.round((completed / fieldsToCheck.length) * 100)
}

export async function getRecentActivity() {
    const session = await auth()
    if (!session) throw new Error('Unauthorized')

    // Fetch top 3 items from key tables sorted by date
    const [projects, testimonials] = await Promise.all([
        prisma.project.findMany({ take: 3, orderBy: { createdAt: 'desc' } }),
        prisma.testimonial.findMany({ take: 3, orderBy: { createdAt: 'desc' } })
    ])

    // Combine and sort
    const activity = [
        ...projects.map(p => ({
            id: p.id,
            type: 'Project',
            name: p.title,
            date: p.createdAt
        })),
        ...testimonials.map(t => ({
            id: t.id,
            type: 'Testimonial',
            name: `from ${t.name}`,
            date: t.createdAt
        }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)

    return activity
}

export async function toggleSiteSetting(key: string, value: boolean) {
    const session = await auth()
    if (!session) return { success: false, error: 'Unauthorized' }

    try {
        const settings = await prisma.siteSettings.findFirst()
        if (!settings) throw new Error('Settings not found')

        await prisma.siteSettings.update({
            where: { id: settings.id },
            data: { [key]: value }
        })

        revalidatePath('/admin')
        revalidatePath('/')
        return { success: true }
    } catch (error) {
        console.error('Failed to toggle setting', error)
        return { success: false }
    }
}

export async function getMessages() {
    const session = await auth()
    if (!session) throw new Error('Unauthorized')

    return await prisma.message.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50
    })
}

export async function markMessageRead(id: string) {
    const session = await auth()
    if (!session) return { success: false, error: 'Unauthorized' }

    try {
        await prisma.message.update({
            where: { id },
            data: { isRead: true }
        })
        revalidatePath('/admin')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Failed to mark read' }
    }
}

export async function deleteMessage(id: string) {
    const session = await auth()
    if (!session) return { success: false, error: 'Unauthorized' }

    try {
        await prisma.message.delete({ where: { id } })
        revalidatePath('/admin')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Failed to delete message' }
    }
}

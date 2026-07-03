'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getDashboardStats() {
    const session = await auth()
    if (!session) throw new Error('Unauthorized')

    const [
        activeProjectsCount,
        activeTestimonialsCount,
        skillsCount,
        activeServicesCount,
        activeClientsCount,
        messagesCount
    ] = await Promise.all([
        prisma.project.count({ where: { isActive: true } }),
        prisma.testimonial.count({ where: { isActive: true } }),
        prisma.skill.count(),
        prisma.service.count(),
        prisma.client.count({ where: { isActive: true } }),
        prisma.message.count({ where: { isRead: false } })
    ])

    return {
        projects: activeProjectsCount,
        testimonials: activeTestimonialsCount,
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
        'name',
        'email',
        'phone',
        'avatarUrl',
        'bio',
        'github',
        'linkedin',
        'cvUrl',
        'title',
        'location'
    ]

    let completed = 0
    const profileRecord = profile as Record<string, unknown>
    fieldsToCheck.forEach(field => {
        const value = profileRecord[field]
        if (typeof value === 'string' && value.length > 0) {
            completed++
        }
    })

    return Math.round((completed / fieldsToCheck.length) * 100)
}

export async function getRecentActivity() {
    const session = await auth()
    if (!session) throw new Error('Unauthorized')

    // Fetch top 3 items from all key tables sorted by date
    const [projects, testimonials, experiences, services, certifications, referees] = await Promise.all([
        prisma.project.findMany({ take: 3, orderBy: { createdAt: 'desc' } }),
        prisma.testimonial.findMany({ take: 3, orderBy: { createdAt: 'desc' } }),
        prisma.experience.findMany({ take: 3, orderBy: { createdAt: 'desc' } }),
        prisma.service.findMany({ take: 3, orderBy: { createdAt: 'desc' } }),
        prisma.certification.findMany({ take: 3, orderBy: { createdAt: 'desc' } }),
        prisma.referee.findMany({ take: 3, orderBy: { createdAt: 'desc' } })
    ])

    // Combine and sort
    const activity = [
        ...projects.map(p => ({
            id: p.id,
            type: 'Project Added',
            name: p.title,
            date: p.createdAt
        })),
        ...testimonials.map(t => ({
            id: t.id,
            type: 'Testimonial Added',
            name: `from ${t.name}`,
            date: t.createdAt
        })),
        ...experiences.map(e => ({
            id: e.id,
            type: 'Experience Added',
            name: e.jobTitle,
            date: e.createdAt
        })),
        ...services.map(s => ({
            id: s.id,
            type: 'Service Added',
            name: s.title,
            date: s.createdAt
        })),
        ...certifications.map(c => ({
            id: c.id,
            type: 'Certification Added',
            name: c.name,
            date: c.createdAt
        })),
        ...referees.map(r => ({
            id: r.id,
            type: 'Referee Added',
            name: r.name,
            date: r.createdAt
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

export async function getMessages(skip: number = 0, take: number = 200) {
    const session = await auth()
    if (!session) throw new Error('Unauthorized')

    return await prisma.message.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take
    })
}

export async function deleteMessages(ids: string[]) {
    const session = await auth()
    if (!session) return { success: false, error: 'Unauthorized' }

    try {
        await prisma.message.deleteMany({
            where: { id: { in: ids } }
        })
        revalidatePath('/admin')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Failed to delete messages' }
    }
}

export async function markMessagesRead(ids: string[]) {
    const session = await auth()
    if (!session) return { success: false, error: 'Unauthorized' }

    try {
        await prisma.message.updateMany({
            where: { id: { in: ids } },
            data: { isRead: true }
        })
        revalidatePath('/admin')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Failed to mark messages as read' }
    }
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

export async function markMessageUnread(id: string) {
    const session = await auth()
    if (!session) return { success: false, error: 'Unauthorized' }

    try {
        await prisma.message.update({
            where: { id },
            data: { isRead: false }
        })
        revalidatePath('/admin')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Failed to mark unread' }
    }
}

export async function markAllMessagesRead() {
    const session = await auth()
    if (!session) return { success: false, error: 'Unauthorized' }

    try {
        await prisma.message.updateMany({
            where: { isRead: false },
            data: { isRead: true }
        })
        revalidatePath('/admin')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Failed to mark all as read' }
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

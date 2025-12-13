'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ProjectSchema } from '@/lib/schemas'
import { revalidatePath } from 'next/cache'

// GET
export async function getProjects() {
    const session = await auth()
    if (!session) throw new Error('Unauthorized')

    return await prisma.project.findMany({
        orderBy: { order: 'asc' }
    })
}

// CREATE
export async function createProject(data: any) {
    const session = await auth()
    if (!session) return { success: false, error: 'Unauthorized' }

    const result = ProjectSchema.safeParse(data)
    if (!result.success) {
        return { success: false, error: 'Invalid data' }
    }

    try {
        await prisma.project.create({
            data: result.data
        })
        revalidatePath('/admin/projects')
        revalidatePath('/') // Updates public portfolio
        return { success: true }
    } catch (error) {
        console.error('Create Project Error:', error)
        return { success: false, error: 'Failed to create project' }
    }
}

// UPDATE
export async function updateProject(id: string, data: any) {
    const session = await auth()
    if (!session) return { success: false, error: 'Unauthorized' }

    const result = ProjectSchema.safeParse(data)
    if (!result.success) {
        return { success: false, error: 'Invalid data' }
    }

    try {
        await prisma.project.update({
            where: { id },
            data: result.data
        })
        revalidatePath('/admin/projects')
        revalidatePath('/')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Failed to update project' }
    }
}

// DELETE
export async function deleteProject(id: string) {
    const session = await auth()
    if (!session) return { success: false, error: 'Unauthorized' }

    try {
        await prisma.project.delete({
            where: { id }
        })
        revalidatePath('/admin/projects')
        revalidatePath('/')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Failed to delete project' }
    }
}

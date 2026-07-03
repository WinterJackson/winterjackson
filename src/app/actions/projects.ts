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
export async function createProject(data: unknown) {
    const session = await auth()
    if (!session) return { success: false, error: 'Unauthorized' }

    const result = ProjectSchema.safeParse(data)
    if (!result.success) {
        return { success: false, error: 'Invalid data' }
    }

    try {
        await prisma.$transaction(async (tx) => {
            // Shift existing projects down to make room for the new order
            await tx.project.updateMany({
                where: { order: { gte: result.data.order } },
                data: { order: { increment: 1 } }
            })
            
            await tx.project.create({
                data: result.data
            })
        })
        revalidatePath('/admin/projects')
        revalidatePath('/admin') // Update Dashboard Stats
        revalidatePath('/') // Updates public portfolio
        return { success: true }
    } catch (error) {
        console.error('Create Project Error:', error)
        return { success: false, error: 'Failed to create project' }
    }
}

// UPDATE
export async function updateProject(id: string, data: unknown) {
    const session = await auth()
    if (!session) return { success: false, error: 'Unauthorized' }

    const result = ProjectSchema.safeParse(data)
    if (!result.success) {
        return { success: false, error: 'Invalid data' }
    }

    try {
        await prisma.$transaction(async (tx) => {
            const existing = await tx.project.findUnique({ where: { id } })
            
            if (existing && existing.order !== result.data.order) {
                // Moving the project UP the list (e.g. from order 5 to 1) -> shift others DOWN
                if (result.data.order < existing.order) {
                    await tx.project.updateMany({
                        where: { order: { gte: result.data.order, lt: existing.order } },
                        data: { order: { increment: 1 } }
                    })
                } 
                // Moving the project DOWN the list (e.g. from order 1 to 5) -> shift others UP
                else {
                    await tx.project.updateMany({
                        where: { order: { gt: existing.order, lte: result.data.order } },
                        data: { order: { decrement: 1 } }
                    })
                }
            }
            
            await tx.project.update({
                where: { id },
                data: result.data
            })
        })
        revalidatePath('/admin/projects')
        revalidatePath('/admin') // Update Dashboard Stats
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
        await prisma.$transaction(async (tx) => {
            const existing = await tx.project.findUnique({ where: { id } })
            
            await tx.project.delete({
                where: { id }
            })
            
            // Shift remaining projects up to close the gap
            if (existing) {
                await tx.project.updateMany({
                    where: { order: { gt: existing.order } },
                    data: { order: { decrement: 1 } }
                })
            }
        })
        revalidatePath('/admin/projects')
        revalidatePath('/admin') // Update Dashboard Stats
        revalidatePath('/')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Failed to delete project' }
    }
}

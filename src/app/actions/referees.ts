'use server'

import { prisma } from '@/lib/prisma'
import { RefereeFormData, RefereeSchema } from '@/lib/schemas'
import { revalidatePath } from 'next/cache'

export async function getReferees() {
    try {
        const referees = await prisma.referee.findMany({
            orderBy: {
                order: 'asc',
            },
        })
        return referees
    } catch (error) {
        console.error('Failed to fetch referees:', error)
        return []
    }
}

export async function getReferee(id: string) {
    try {
        return await prisma.referee.findUnique({
            where: { id }
        })
    } catch (error) {
        console.error('Failed to fetch referee:', error)
        return null
    }
}

export async function createReferee(data: RefereeFormData) {
    try {
        const validatedData = RefereeSchema.parse(data)
        
        await prisma.referee.create({
            data: validatedData
        })
        
        revalidatePath('/')
        revalidatePath('/admin/referees')
        return { success: true }
    } catch (error) {
        console.error('Failed to create referee:', error)
        return { success: false, error: 'Failed to create referee' }
    }
}

export async function updateReferee(id: string, data: RefereeFormData) {
    try {
        const validatedData = RefereeSchema.parse(data)
        
        await prisma.referee.update({
            where: { id },
            data: validatedData
        })
        
        revalidatePath('/')
        revalidatePath('/admin/referees')
        return { success: true }
    } catch (error) {
        console.error('Failed to update referee:', error)
        return { success: false, error: 'Failed to update referee' }
    }
}

export async function deleteReferee(id: string) {
    try {
        await prisma.referee.delete({
            where: { id }
        })
        
        revalidatePath('/')
        revalidatePath('/admin/referees')
        return { success: true }
    } catch (error) {
        console.error('Failed to delete referee:', error)
        return { success: false, error: 'Failed to delete referee' }
    }
}

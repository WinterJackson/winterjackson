'use server'

import { prisma } from '@/lib/prisma'
import { CertificationFormData, CertificationSchema } from '@/lib/schemas'
import { revalidatePath } from 'next/cache'

export async function getCertifications() {
    try {
        const certifications = await prisma.certification.findMany({
            orderBy: {
                order: 'asc',
            },
        })
        return certifications
    } catch (error) {
        console.error('Failed to fetch certifications:', error)
        return []
    }
}

export async function getCertification(id: string) {
    try {
        return await prisma.certification.findUnique({
            where: { id }
        })
    } catch (error) {
        console.error('Failed to fetch certification:', error)
        return null
    }
}

export async function createCertification(data: CertificationFormData) {
    try {
        const validatedData = CertificationSchema.parse(data)
        
        await prisma.certification.create({
            data: validatedData
        })
        
        revalidatePath('/')
        revalidatePath('/admin/certifications')
        return { success: true }
    } catch (error) {
        console.error('Failed to create certification:', error)
        return { success: false, error: 'Failed to create certification' }
    }
}

export async function updateCertification(id: string, data: CertificationFormData) {
    try {
        const validatedData = CertificationSchema.parse(data)
        
        await prisma.certification.update({
            where: { id },
            data: validatedData
        })
        
        revalidatePath('/')
        revalidatePath('/admin/certifications')
        return { success: true }
    } catch (error) {
        console.error('Failed to update certification:', error)
        return { success: false, error: 'Failed to update certification' }
    }
}

export async function deleteCertification(id: string) {
    try {
        await prisma.certification.delete({
            where: { id }
        })
        
        revalidatePath('/')
        revalidatePath('/admin/certifications')
        return { success: true }
    } catch (error) {
        console.error('Failed to delete certification:', error)
        return { success: false, error: 'Failed to delete certification' }
    }
}

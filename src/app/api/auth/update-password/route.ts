import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const PasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
})

export async function PUT(req: Request) {
    try {
        const session = await auth()
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { currentPassword, newPassword } = PasswordSchema.parse(body)

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        if (!user || !user.password) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password)
        if (!isMatch) {
            return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 })
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12)

        await prisma.user.update({
            where: { email: session.user.email },
            data: { password: hashedPassword },
        })

        return NextResponse.json({ success: true })

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues[0]?.message || 'Invalid input' }, { status: 400 })
        }
        return NextResponse.json({ error: 'Failed to update password' }, { status: 500 })
    }
}


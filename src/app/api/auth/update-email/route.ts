import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { EmailChangeSchema } from '@/lib/schemas'
import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'
import { z } from 'zod'

export async function PUT(req: Request) {
    try {
        const session = await auth()
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { newEmail, currentPassword } = EmailChangeSchema.parse(body)

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

        // Check if new email is already taken
        const existingUser = await prisma.user.findUnique({
            where: { email: newEmail },
        })

        if (existingUser) {
            return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
        }

        await prisma.user.update({
            where: { email: session.user.email },
            data: { email: newEmail },
        })

        return NextResponse.json({ success: true })

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues[0]?.message || 'Invalid input' }, { status: 400 })
        }
        console.error('Email update error:', error)
        return NextResponse.json({ error: 'Failed to update email' }, { status: 500 })
    }
}

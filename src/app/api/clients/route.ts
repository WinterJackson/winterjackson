import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { ClientSchema } from '@/lib/schemas'
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const clients = await prisma.client.findMany({
            orderBy: { order: 'asc' },
        })
        return NextResponse.json(clients)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const validatedData = ClientSchema.parse(body)

        const client = await prisma.client.create({
            data: validatedData,
        })

        revalidatePath('/')
        revalidatePath('/admin')

        return NextResponse.json(client)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create client' }, { status: 500 })
    }
}

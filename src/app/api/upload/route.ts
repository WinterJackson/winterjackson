import { mkdir, writeFile } from 'fs/promises'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        // Create videos directory if it doesn't exist
        const videosDir = path.join(process.cwd(), 'public', 'videos')
        await mkdir(videosDir, { recursive: true })

        // Generate unique filename
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const filename = `${Date.now()}-${file.name.replace(/\s/g, '-')}`
        const filepath = path.join(videosDir, filename)

        // Write file
        await writeFile(filepath, buffer)

        // Return public URL
        return NextResponse.json({ url: `/videos/${filename}` })
    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }
}

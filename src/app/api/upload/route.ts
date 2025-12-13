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

        // Determine directory based on file type
        const isVideo = file.type.startsWith('video/')
        const uploadDir = isVideo ? 'videos' : 'images/uploads'
        const targetDir = path.join(process.cwd(), 'public', uploadDir)

        await mkdir(targetDir, { recursive: true })

        // Generate unique filename
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`
        const filepath = path.join(targetDir, filename)

        // Write file
        await writeFile(filepath, buffer)

        // Return public URL
        return NextResponse.json({ url: `/${uploadDir}/${filename}` })
    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }
}

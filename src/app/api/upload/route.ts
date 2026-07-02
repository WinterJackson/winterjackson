import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
        const MAX_VIDEO_SIZE = 50 * 1024 * 1024 // 50MB
        const MAX_DOC_SIZE = 10 * 1024 * 1024 // 10MB

        const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
        const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg']
        const allowedDocTypes = [
            'application/pdf', 
            'application/msword', 
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ]
        const allowedMimeTypes = [...allowedImageTypes, ...allowedVideoTypes, ...allowedDocTypes]

        if (!allowedMimeTypes.includes(file.type)) {
            return NextResponse.json(
                { error: `Invalid file type: ${file.type}. Only images, videos, and documents are allowed.` },
                { status: 415 }
            )
        }

        const isVideo = allowedVideoTypes.includes(file.type)
        const isDoc = allowedDocTypes.includes(file.type)
        
        let maxSize = MAX_IMAGE_SIZE
        let maxLabel = '10MB'
        
        if (isVideo) {
            maxSize = MAX_VIDEO_SIZE
            maxLabel = '50MB'
        } else if (isDoc) {
            maxSize = MAX_DOC_SIZE
            maxLabel = '10MB'
        }

        if (file.size > maxSize) {
            return NextResponse.json(
                { error: `File size exceeds ${maxLabel} limit` },
                { status: 413 }
            )
        }

        // Authenticate User
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get Cloudinary config from env
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

        if (!cloudName || !uploadPreset) {
            console.error('Cloudinary config missing')
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
        }

        // Prepare upload to Cloudinary
        const uploadFormData = new FormData()
        uploadFormData.append('file', file)
        uploadFormData.append('upload_preset', uploadPreset)

        // Upload to Cloudinary
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
            {
                method: 'POST',
                body: uploadFormData,
            }
        )

        if (!response.ok) {
            const error = await response.json()
            console.error('Cloudinary error:', error)
            throw new Error('Cloudinary upload failed')
        }

        const data = await response.json()

        // Return the secure URL from Cloudinary
        return NextResponse.json({
            url: data.secure_url,
            // Include other metadata if needed
            width: data.width,
            height: data.height,
            format: data.format,
            resource_type: data.resource_type
        })

    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }
}

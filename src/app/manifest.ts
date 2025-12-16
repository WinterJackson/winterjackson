
import { prisma } from '@/lib/prisma'
import { MetadataRoute } from 'next'

export default async function manifest(): Promise<MetadataRoute.Manifest> {
    const settings = await prisma.siteSettings.findFirst()

    return {
        name: 'K U Z Z I - D E V',
        short_name: 'K U Z Z I - D E V',
        description: settings?.metaDescription || 'Winter Jackson - Software Developer Portfolio',
        start_url: '/',
        display: 'standalone',
        background_color: '#1a1a1a',
        theme_color: settings?.primaryColor || '#421b1c',
        icons: [
            {
                src: settings?.logoUrl || '/images/my-avatar.webp',
                sizes: '192x192',
                type: 'image/webp',
            },
            {
                src: settings?.logoUrl || '/images/my-avatar.webp',
                sizes: '512x512',
                type: 'image/webp',
            },
            {
                src: settings?.logoUrl || '/images/my-avatar.webp',
                sizes: 'any',
                type: 'image/webp',
            },
        ],
    }
}

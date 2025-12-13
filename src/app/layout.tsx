import { Providers } from '@/components/Providers'
import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import Script from 'next/script'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--ff-poppins',
})

import { prisma } from '@/lib/prisma'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await prisma.siteSettings.findFirst()

  return {
    title: settings?.metaTitle || 'Winter Jackson',
    description: settings?.metaDescription || 'Software Developer Portfolio - Winter Jackson',
    keywords: settings?.metaKeywords?.split(',') || ['software', 'developer', 'portfolio'],
    openGraph: {
      images: settings?.ogImageUrl ? [{ url: settings.ogImageUrl }] : [],
    },
    icons: {
      icon: [
        { url: '/images/my-avatar.webp', type: 'image/webp' },
        { url: '/images/my-avatar.png', type: 'image/png' },
      ],
    },
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await prisma.siteSettings.findFirst()

  return (
    <html lang="en" className={poppins.variable} suppressHydrationWarning>
      <body 
        suppressHydrationWarning
        style={{
            '--primary-color': settings?.primaryColor || '#FFDB70',
        } as React.CSSProperties}
      >
        <Script src="https://upload-widget.cloudinary.com/global/all.js" strategy="beforeInteractive" />
        <Providers>
          {children}
        </Providers>
        <Toaster position="bottom-right" toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
          },
        }} />
      </body>
    </html>
  )
}

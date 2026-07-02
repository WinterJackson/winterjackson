import { Providers } from '@/components/Providers'
import type { Metadata, Viewport } from 'next'
import { Poppins } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--ff-poppins',
})

import { prisma } from '@/lib/prisma'

export const viewport: Viewport = {
  themeColor: '#421b1c',
}

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
      icon: settings?.logoUrl || '/images/my-avatar.webp',
      shortcut: settings?.logoUrl || '/images/my-avatar.webp',
      apple: settings?.logoUrl || '/images/my-avatar.webp',
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: settings?.metaTitle || 'Winter Jackson',
    },
    formatDetection: {
      telephone: false,
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

        <Providers>
          {children}
        </Providers>
        {settings?.googleAnalyticsId && (
          <GoogleAnalytics gaId={settings.googleAnalyticsId} />
        )}
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

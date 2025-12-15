'use client'

import AdminBottomNav from '@/components/admin/AdminBottomNav'
import AdminMobileNav from '@/components/admin/AdminMobileNav'
import { adminNavItems } from '@/lib/adminNav'
import { Profile, SiteSettings } from '@prisma/client'
import { LogOut } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import React from 'react'
import { Toaster } from 'react-hot-toast'
import styles from '../../app/admin/layout.module.css'

interface AdminLayoutClientProps {
  children: React.ReactNode
  profile: Profile | null
  settings: SiteSettings | null
}

export default function AdminLayoutClient({ children, profile, settings }: AdminLayoutClientProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()
  const currentYear = new Date().getFullYear()

  React.useEffect(() => {
    if (status === 'unauthenticated' && pathname !== '/admin/login') {
      router.push('/admin/login')
    }
  }, [status, pathname, router])

  // If we're on the login page, don't show the admin layout
  if (pathname === '/admin/login') {
    return (
      <>
        {children}
        <Toaster position="bottom-right" />
      </>
    )
  }

  if (status === 'loading') {
      return null // Or a spinner
  }

  if (!session && pathname !== '/admin/login') {
      return null // Prevent flash before redirect happens in useEffect
  }

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2>Admin Panel</h2>
        </div>

        <nav className={styles.nav}>
          {adminNavItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`${styles.navLink} ${
                pathname === item.path ? styles.activeNavLink : ''
              }`}
            >
              <item.icon />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <button onClick={() => signOut()} className={styles.logoutBtn}>
            <LogOut />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className={styles.main}>
        {children}

        {/* Admin Footer */}
        <div className="copyright" style={{ marginTop: 'auto', paddingTop: '2rem', paddingBottom: '1rem', color: '#888', whiteSpace: 'nowrap' }}>
            <div className="cc-text">
            {settings?.footerText ? (
                <p>{settings.footerText.replace(/\{year\}|202[0-9]/g, currentYear.toString())}</p>
            ) : (
                <p>All Rights Reserved. &copy; <em id="currentYear">{currentYear}</em> | {profile?.name || 'Winter Jackson'}</p>
            )}
            </div>
        </div>
      </main>
      <AdminMobileNav />
      <AdminBottomNav />
      <Toaster position="bottom-right" />
    </div>
  )
}

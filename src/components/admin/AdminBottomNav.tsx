'use client'

import { Briefcase, GraduationCap, LayoutDashboard, MessageSquare, Settings, User, Users } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './AdminBottomNav.module.css'

export default function AdminBottomNav() {
  const pathname = usePathname()

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Messages', path: '/admin/messages', icon: MessageSquare },
    { name: 'Clients', path: '/admin/clients', icon: Users },
    { name: 'Profile', path: '/admin/profile', icon: User },
    { name: 'Expe.', path: '/admin/experience', icon: Briefcase }, 
    { name: 'Edu.', path: '/admin/education', icon: GraduationCap },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ]

  return (
    <nav className={styles.bottomNav}>
      {navItems.map((item) => (
        <Link
          key={item.path}
          href={item.path}
          className={`${styles.navItem} ${pathname === item.path ? styles.active : ''}`}
        >
          <item.icon size={20} />
          {/* Optional: Label can be hidden on very small screens if needed, but robust to keep */}
        </Link>
      ))}
    </nav>
  )
}

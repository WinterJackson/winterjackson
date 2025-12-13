import { getDashboardStats, getMessages, getProfileHealth, getRecentActivity } from '@/app/actions/dashboard'
import ActivityFeed from '@/components/admin/dashboard/ActivityFeed'
import AnalyticsCards from '@/components/admin/dashboard/AnalyticsCards'
import ControlCenter from '@/components/admin/dashboard/ControlCenter'
import InboxWidget from '@/components/admin/dashboard/InboxWidget'
import ProfileHealth from '@/components/admin/dashboard/ProfileHealth'
import { prisma } from '@/lib/prisma'
import { Session } from 'next-auth'
import styles from './Dashboard.module.css'

interface DashboardProps {
  session: Session
}

export default async function Dashboard({ session }: DashboardProps) {
  // Parallel data fetching
  const [stats, healthScore, activity, messages, settings] = await Promise.all([
    getDashboardStats(),
    getProfileHealth(),
    getRecentActivity(),
    getMessages(),
    prisma.siteSettings.findFirst()
  ])

  return (
    <div className={styles.dashboard}>
      
      {/* Header */}
      <header className={styles.header}>
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back, {session?.user?.name || 'Admin'}</p>
          <p className={styles.dateText}>
            {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </header>
      
      {/* 1. Analytics Cards Row */}
      <AnalyticsCards stats={stats} styles={styles} />

      {/* 2. Bento Grid Layout */}
      <div className={styles.bentoGrid}>
        
        {/* Column 1: Activity Feed */}
        <div style={{ gridRow: 'span 2' }}>
           <ActivityFeed activities={activity} styles={styles} />
        </div>

        {/* Column 2: Inbox */}
        <div style={{ gridColumn: 'span 1' }}>
           <InboxWidget initialMessages={messages} styles={styles} />
        </div>

        {/* Column 3: Stacked Widgets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
           <div style={{ flex: 1 }}>
             <ProfileHealth score={healthScore} styles={styles} />
           </div>
           
           <div style={{ flex: 1 }}>
             <ControlCenter settings={settings} styles={styles} />
           </div>


        </div>
      </div>
    </div>
  )
}

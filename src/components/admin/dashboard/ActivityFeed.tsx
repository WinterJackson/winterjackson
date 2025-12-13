'use client'

import { Clock, History } from 'lucide-react'

interface ActivityItem {
  id: string
  type: string
  name: string
  date: Date
}

interface ActivityFeedProps {
  activities: ActivityItem[]
  styles: any
}

export default function ActivityFeed({ activities, styles }: ActivityFeedProps) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
         <div className={styles.cardTitle}>
            <History size={20} className="text-blue-500" style={{ color: '#3b82f6' }} />
            Recent Activity
         </div>
      </div>

      <div className={styles.activityList}>
        {activities.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
             <Clock size={32} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
             <p>No recent activity</p>
          </div>
        ) : (
             activities.map((item, index) => (
                <div key={index} className={styles.activityItem}>
                   <div className={styles.activityMarker} />
                   <div className={styles.activityContent}>
                      <h4>{item.type}: {item.name}</h4>
                      <time>{new Date(item.date).toLocaleDateString()} {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
                   </div>
                </div>
             ))
        )}
      </div>
    </div>
  )
}

'use client'

import { Briefcase, Code, Eye, MessageSquare, Users, Zap } from 'lucide-react'
import Link from 'next/link'

interface AnalyticsCardsProps {
  stats: {
    projects: number
    testimonials: number
    skills: number
    services: number
    clients: number
    unreadMessages: number
  }
  styles: any
}

export default function AnalyticsCards({ stats, styles }: AnalyticsCardsProps) {
  const cards = [
    { label: 'Total Projects', value: stats.projects, icon: Code, color: '#8b5cf6', path: '/admin/projects' },
    { label: 'Testimonials', value: stats.testimonials, icon: MessageSquare, color: '#10b981', path: '/admin/testimonials' },
    { label: 'Active Services', value: stats.services, icon: Briefcase, color: '#f59e0b', path: '/admin/services' },
    { label: 'Active Clients', value: stats.clients, icon: Users, color: '#3b82f6', path: '/admin/clients' },
    { label: 'Total Skills', value: stats.skills, icon: Zap, color: '#eab308', path: '/admin/skills' },
    { label: 'New Messages', value: stats.unreadMessages, icon: Eye, color: '#ec4899', path: '/admin/messages' },
  ]

  return (
    <div className={styles.analyticsGrid}>
      {cards.map((card, index) => (
        <Link 
          key={index} 
          href={card.path} 
          className={styles.statCard} 
          style={{ textDecoration: 'none', cursor: 'pointer' }}
        >
          <div 
            className={styles.statIcon}
            style={{ 
              background: `${card.color}20`, 
              color: card.color 
            }}
          >
            <card.icon size={24} />
          </div>
          <div className={styles.statInfo}>
            <h3>{card.value}</h3>
            <p>{card.label}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}

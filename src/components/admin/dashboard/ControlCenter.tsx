'use client'

import { toggleSiteSetting } from '@/app/actions/dashboard'
import { SiteSettings } from '@prisma/client'
import { Eye, EyeOff, Power, Settings2 } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import tooltipStyles from '../Tooltips.module.css'

interface ControlCenterProps {
  settings: SiteSettings | null
  styles: any
}

export default function ControlCenter({ settings, styles }: ControlCenterProps) {
  const [localSettings, setLocalSettings] = useState(settings)
  const [loading, setLoading] = useState<string | null>(null)

  const handleToggle = async (key: string, currentValue: boolean) => {
    setLoading(key)
    setLocalSettings(prev => prev ? ({ ...prev, [key]: !currentValue }) : null)

    const res = await toggleSiteSetting(key, !currentValue)
    
    if (!res.success) {
      setLocalSettings(prev => prev ? ({ ...prev, [key]: currentValue }) : null)
      toast.error('Failed to update setting')
    } else {
      toast.success('Setting updated')
    }
    setLoading(null)
  }

  if (!localSettings) return null

  const controls = [
    { 
      key: 'maintenanceMode', 
      label: 'Maintenance Mode', 
      icon: Power, 
      color: '#ef4444',
      desc: 'Takes the site offline. Only admin can login.'
    },
    { 
      key: 'showProjects', 
      label: 'Show Projects', 
      icon: localSettings.showProjects ? Eye : EyeOff, 
      color: '#8b5cf6',
      desc: 'Show/Hide the Projects section on public site.'
    },
    { 
      key: 'showServices', 
      label: 'Show Services', 
      icon: localSettings.showServices ? Eye : EyeOff, 
      color: '#f59e0b',
      desc: 'Show/Hide the Services section on public site.'
    },
  ]


  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
         <div className={styles.cardTitle}>
            <Settings2 size={20} style={{ color: 'var(--bittersweet-shimmer)' }} />
            Controls
         </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {controls.map((control) => (
          <div 
            key={control.key} 
            className={`${styles.controlItem} ${tooltipStyles.tooltip}`}
            data-tooltip={control.desc}
          >
            <div className={styles.controlLabel}>
              <control.icon size={16} color={control.color} />
              <span>{control.label}</span>
            </div>

            <div 
               onClick={() => handleToggle(control.key, (localSettings as any)[control.key])}
               style={{ 
                 width: '40px', 
                 height: '24px', 
                 background: (localSettings as any)[control.key] ? 'var(--bittersweet-shimmer)' : 'var(--jet)', 
                 borderRadius: '20px', 
                 position: 'relative',
                 cursor: 'pointer',
                 transition: '0.3s'
               }}
            >
               <div style={{
                  width: '18px',
                  height: '18px',
                  background: 'white',
                  borderRadius: '50%',
                  position: 'absolute',
                  top: '3px',
                  left: (localSettings as any)[control.key] ? '19px' : '3px',
                  transition: '0.3s'
               }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
         <a 
           href="/" 
           target="_blank"
           className={styles.quickLink}
           style={{ 
             display: 'flex', 
             alignItems: 'center', 
             justifyContent: 'center', 
             gap: '8px', 
             textDecoration: 'none',
             background: 'var(--border-gradient-onyx)',
             border: '1px solid var(--jet)',
             color: 'var(--orange-yellow-crayola)'
           }}
         >
           <Eye size={18} />
           View Live Site
         </a>
      </div>
    </div>
  )
}

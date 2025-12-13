'use client'

import { AlertCircle, CheckCircle2, Trophy } from 'lucide-react'

interface ProfileHealthProps {
  score: number
  styles: any
}

export default function ProfileHealth({ score, styles }: ProfileHealthProps) {
  const radius = 60
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  
  const getColor = (s: number) => {
    if (s >= 80) return '#10b981' // Emerald
    if (s >= 50) return '#f59e0b' // Amber
    return '#ef4444' // Red
  }

  const color = getColor(score)

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
         <div className={styles.cardTitle}>
            <Trophy size={18} className="text-yellow-500" style={{ color: '#f59e0b' }} />
            Profile Health
         </div>
      </div>

      <div className={styles.healthCircle}>
        <svg width="150" height="150" style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx="75"
            cy="75"
            r={radius}
            stroke="var(--jet)"
            strokeWidth="10"
            fill="transparent"
          />
          <circle
            cx="75"
            cy="75"
            r={radius}
            stroke={color}
            strokeWidth="10"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
        </svg>
        <div className={styles.healthText}>
          <span className={styles.healthScore}>{score}%</span>
          <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--light-gray-70)' }}>Optimized</span>
        </div>
      </div>

      <div style={{ marginTop: 'auto', paddingTop: '20px', display: 'flex', gap: '10px', alignItems: 'center', fontSize: '14px' }}>
        {score === 100 ? (
           <>
            <CheckCircle2 size={18} color="#10b981" />
            <span style={{ color: '#10b981' }}>Perfect!</span>
           </>
        ) : (
           <>
            <AlertCircle size={18} color="#f59e0b" />
            <span style={{ color: '#f59e0b' }}>Complete detailed info</span>
           </>
        )}
      </div>
    </div>
  )
}

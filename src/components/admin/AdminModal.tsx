'use client'

import { X } from 'lucide-react'
import { ReactNode } from 'react'
import styles from './AdminModal.module.css'

interface AdminModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export default function AdminModal({
  isOpen,
  onClose,
  title,
  children
}: AdminModalProps) {
  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.content} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>{title}</h2>
          <button onClick={onClose} className={styles.closeBtn}>
            <X />
          </button>
        </div>
        
        {/* Container for modal content */}
        <div className={styles.body}>
          {children}
        </div>
      </div>
    </div>
  )
}

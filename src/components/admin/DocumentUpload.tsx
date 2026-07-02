'use client'

import { CloudUpload, FileText, Loader2 } from 'lucide-react'
import { useState, useId } from 'react'
import styles from './ImageUpload.module.css'

interface DocumentUploadProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  label?: string
}

export default function DocumentUpload({
  value,
  onChange,
  disabled,
  label = 'Upload Document'
}: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false)
  const id = useId()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid PDF or Word Document')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!res.ok) throw new Error('Upload failed')

      const data = await res.json()
      onChange(data.url)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload document')
    } finally {
      setUploading(false)
    }
  }

  // Extract filename from URL for display if possible
  const getFileName = (url: string) => {
    try {
      const parts = url.split('/')
      const lastPart = parts[parts.length - 1]
      return lastPart.length > 20 ? lastPart.substring(0, 20) + '...' : lastPart
    } catch {
      return 'Document'
    }
  }

  return (
    <div className={styles.container}>
      {label && <label className={styles.label}>{label}</label>}
      
      <div className={styles.uploadArea}>
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          disabled={disabled || uploading}
          className="hidden"
          id={id}
        />
        
        {value ? (
          <div className={styles.previewContainer}>
            <div className="flex flex-col items-center justify-center h-full text-white/50 gap-4 w-full">
              <FileText size={48} className="text-[#FFDB70]" />
              <div className="text-center">
                <span className="text-sm font-medium text-white/90 block">Document Uploaded</span>
                <span className="text-xs text-white/50 block mt-1">{getFileName(value)}</span>
              </div>
            </div>
            <div className={styles.overlay}>
              <label htmlFor={id} className={styles.changeBtn}>
                <CloudUpload />
                Replace File
              </label>
            </div>
          </div>
        ) : (
          <label htmlFor={id} className={styles.placeholder} style={{ cursor: 'pointer', width: '100%' }}>
            <div className={styles.iconWrapper}>
              {uploading ? (
                 <Loader2 className={`${styles.icon} animate-spin`} />
               ) : (
                 <FileText className={styles.icon} />
               )}
            </div>
            <div>
              <div className={styles.textMain}>
                {uploading ? 'Uploading...' : 'Click to upload Document'}
              </div>
              <div className={styles.textSub}>
                PDF, DOC, DOCX (max 10MB)
              </div>
            </div>
          </label>
        )}
      </div>
    </div>
  )
}

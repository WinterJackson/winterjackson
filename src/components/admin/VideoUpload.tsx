'use client'

import { CloudUpload, Video } from 'lucide-react'
import { useState } from 'react'
import styles from './ImageUpload.module.css'

interface VideoUploadProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  label?: string
}

export default function VideoUpload({
  value,
  onChange,
  disabled,
  label = 'Upload Video'
}: VideoUploadProps) {
  const [uploading, setUploading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('video/')) {
      alert('Please select a video file')
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
      alert('Failed to upload video')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className={styles.container}>
      {label && <label className={styles.label}>{label}</label>}
      
      <div className={styles.uploadArea}>
        <input
          type="file"
          accept="video/mp4,video/webm,video/ogg"
          onChange={handleFileChange}
          disabled={disabled || uploading}
          className="hidden"
          id="video-upload"
        />
        
        {value ? (
          <div className={styles.previewContainer}>
            <video 
              src={value} 
              className={styles.previewImage}
              controls
              style={{ maxHeight: '200px' }}
            />
            <div className={styles.overlay}>
              <label htmlFor="video-upload" className={styles.changeBtn}>
                <CloudUpload />
                Change Video
              </label>
            </div>
          </div>
        ) : (
          <label htmlFor="video-upload" className={styles.placeholder} style={{ cursor: 'pointer' }}>
            <div className={styles.iconWrapper}>
              <Video className={styles.icon} />
            </div>
            <div>
              <div className={styles.textMain}>
                {uploading ? 'Uploading...' : 'Click to upload video'}
              </div>
              <div className={styles.textSub}>
                MP4, WEBM, OGG (max 50MB)
              </div>
            </div>
          </label>
        )}
      </div>
    </div>
  )
}

'use client'

import { CloudUpload, FileText, Image as ImageIcon, Loader2, Paperclip } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import styles from './ImageUpload.module.css'

interface ImageUploadProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  label?: string
  resourceType?: 'image' | 'raw' | 'video' | 'auto'
}

export default function ImageUpload({
  value,
  onChange,
  disabled,
  label = 'Upload Image',
  resourceType = 'image'
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

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
      alert('Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  const renderPreview = () => {
    if (resourceType === 'raw' || value.endsWith('.pdf')) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-white/50 gap-4">
          <FileText size={48} />
          <span className="text-sm font-medium text-white/90">Document Uploaded</span>
        </div>
      )
    }

    /* Video preview logic if needed here, though VideoUpload handles strict video */
    if (resourceType === 'video' || value.match(/\.(mp4|webm|ogg)$/)) {
        return (
            <video 
                src={value} 
                className={styles.previewImage} 
                controls 
            />
        )
    }

    return (
      <Image
        fill
        src={value}
        alt="Uploaded resource"
        className={styles.previewImage}
      />
    )
  }

  return (
    <div className={styles.container}>
      {label && <label className={styles.label}>{label}</label>}
      
      <div className={styles.uploadArea}>
        <input 
          type="file"
          accept={resourceType === 'image' ? "image/*" : ".pdf,.doc,.docx"}
          onChange={handleFileChange}
          disabled={disabled || uploading}
          className="hidden"
          id={`upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
        />

        {value ? (
          <div className={styles.previewContainer}>
            {renderPreview()}
            <div className={styles.overlay}>
              <label 
                htmlFor={`upload-${label.replace(/\s+/g, '-').toLowerCase()}`} 
                className={styles.changeBtn}
              >
                <CloudUpload />
                Change File
              </label>
            </div>
          </div>
        ) : (
          <label 
            htmlFor={`upload-${label.replace(/\s+/g, '-').toLowerCase()}`} 
            className={styles.placeholder} 
            style={{ cursor: 'pointer' }}
          >
            <div className={styles.iconWrapper}>
               {uploading ? (
                 <Loader2 className={`${styles.icon} animate-spin`} />
               ) : (
                 resourceType === 'image' ? <ImageIcon className={styles.icon} /> : <Paperclip className={styles.icon} />
               )}
            </div>
            <div>
              <div className={styles.textMain}>
                {uploading ? 'Uploading...' : `Click to upload ${resourceType === 'raw' ? 'Document' : 'File'}`}
              </div>
              <div className={styles.textSub}>
                {resourceType === 'image' ? 'SVG, PNG, JPG, WEBP' : 'PDF, DOC'} (max 10MB)
              </div>
            </div>
          </label>
        )}
      </div>
    </div>
  )
}

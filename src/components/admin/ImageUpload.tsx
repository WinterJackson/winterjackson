'use client'

import { CloudUpload, FileText, Image as ImageIcon, Paperclip } from 'lucide-react'
import { CldUploadWidget } from 'next-cloudinary'
import Image from 'next/image'
import { useCallback } from 'react'
import styles from './ImageUpload.module.css'

interface ImageUploadProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  label?: string
  resourceType?: 'image' | 'raw' | 'video' | 'auto'
}

interface CloudinaryResult {
  info?: {
    secure_url: string
  } | string
  event?: string
}

export default function ImageUpload({
  value,
  onChange,
  disabled,
  label = 'Upload Image',
  resourceType = 'image'
}: ImageUploadProps) {
  const handleUpload = useCallback((result: CloudinaryResult) => {
    if (typeof result.info === 'object' && result.info?.secure_url) {
      onChange(result.info.secure_url)
    }
  }, [onChange])

  const renderPreview = () => {
    if (resourceType === 'raw' || value.endsWith('.pdf')) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-white/50 gap-4">
          <FileText size={64} />
          <span className="text-sm font-medium text-white/90">Document Uploaded</span>
        </div>
      )
    }

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
      
      <CldUploadWidget 
        onSuccess={handleUpload}
        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'portfolio_preset'}
        options={{
          maxFiles: 1,
          resourceType: resourceType,
          clientAllowedFormats: 
            resourceType === 'image' ? ['png', 'jpeg', 'jpg', 'webp'] :
            resourceType === 'video' ? ['mp4', 'webm', 'ogg'] :
            resourceType === 'raw' ? ['pdf', 'doc', 'docx'] : undefined,
          maxFileSize: 10000000,
        }}
      >
        {({ open }: { open: any }) => {
          return (
            <div 
              onClick={() => !disabled && open()} 
              className={styles.uploadArea}
            >
              {value ? (
                <div className={styles.previewContainer}>
                  {renderPreview()}
                  <div className={styles.overlay}>
                    <div className={styles.changeBtn}>
                      <CloudUpload />
                      Change File
                    </div>
                  </div>
                </div>
              ) : (
                <div className={styles.placeholder}>
                  <div className={styles.iconWrapper}>
                    {resourceType === 'image' ? (
                        <ImageIcon className={styles.icon} />
                    ) : (
                        <Paperclip className={styles.icon} />
                    )}
                  </div>
                  <div>
                    <div className={styles.textMain}>Click to upload {resourceType === 'raw' ? 'Document' : 'File'}</div>
                    <div className={styles.textSub}>
                        {resourceType === 'image' ? 'SVG, PNG, JPG' : 'PDF, DOC, ZIP'} (max 10MB)
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        }}
      </CldUploadWidget>
    </div>
  )
}

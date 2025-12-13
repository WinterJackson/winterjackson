'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'

import formStyles from '@/components/admin/AdminForm.module.css'
import ImageUpload from '@/components/admin/ImageUpload'
import adminStyles from '@/components/admin/Shared.module.css'
import VideoUpload from '@/components/admin/VideoUpload'

const ProfileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  title: z.string().min(1, 'Title is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(1, 'Phone is required'),
  altPhone: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
  bio: z.string().min(10, 'Bio must be at least 10 characters'),
  avatarUrl: z.string().optional(),
  profileVideoUrl: z.string().optional(),
  cvUrl: z.string().optional(),
  github: z.string().optional(),
  linkedin: z.string().optional(),
  whatsapp: z.string().optional(),
})

type ProfileFormData = z.infer<typeof ProfileSchema>

export default function ProfileManager() {
  const [loading, setLoading] = useState(true)
  
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<ProfileFormData>({
    resolver: zodResolver(ProfileSchema)
  })

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/profile')
        const data = await res.json()
        if (data) {
          Object.keys(data).forEach(key => {
            setValue(key as any, data[key] || '')
          })
        }
      } catch (error) {
        toast.error('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [setValue])

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      if (!res.ok) throw new Error('Failed to update profile')
      
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error('Failed to update profile')
    }
  }

  if (loading) {
    return (
      <div className={adminStyles.page}>
        <div className="flex items-center justify-center h-64">
          <span className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></span>
        </div>
      </div>
    )
  }

  return (
    <div className={adminStyles.page}>
      <header className={adminStyles.pageHeader}>
        <h1>Profile Settings</h1>
        <p>Manage your personal and professional information</p>
      </header>
      
      <form onSubmit={handleSubmit(onSubmit)} className={formStyles.form}>
        {/* Personal Information */}
        <h3 className="text-xl font-semibold mb-4">Personal Information</h3>
        
        <div className={formStyles.row}>
          <div className={formStyles.group}>
            <label>Full Name</label>
            <input {...register('name')} className={formStyles.input} />
            {errors.name && <span className="error">{errors.name.message}</span>}
          </div>

          <div className={formStyles.group}>
            <label>Professional Title</label>
            <input {...register('title')} className={formStyles.input} />
            {errors.title && <span className="error">{errors.title.message}</span>}
          </div>
        </div>

        <div className={formStyles.row}>
          <div className={formStyles.group}>
            <label>Email</label>
            <input type="email" {...register('email')} className={formStyles.input} />
            {errors.email && <span className="error">{errors.email.message}</span>}
          </div>

          <div className={formStyles.group}>
            <label>Location</label>
            <input {...register('location')} className={formStyles.input} />
            {errors.location && <span className="error">{errors.location.message}</span>}
          </div>
        </div>

        <div className={formStyles.row}>
          <div className={formStyles.group}>
            <label>Phone</label>
            <input {...register('phone')} className={formStyles.input} />
            {errors.phone && <span className="error">{errors.phone.message}</span>}
          </div>

          <div className={formStyles.group}>
            <label>Alternative Phone (Optional)</label>
            <input {...register('altPhone')} className={formStyles.input} />
          </div>
        </div>

        <div className={formStyles.group}>
          <label>Bio</label>
          <textarea {...register('bio')} className={formStyles.textarea} rows={5} />
          {errors.bio && <span className="error">{errors.bio.message}</span>}
        </div>

        <hr className="my-6 border-gray-700" />

        {/* Media */}
        <h3 className="text-xl font-semibold mb-4">Profile Media</h3>

        <div className={formStyles.group}>
          <ImageUpload
            value={watch('avatarUrl') || ''}
            onChange={(url) => setValue('avatarUrl', url)}
            label="Profile Image"
          />
        </div>

        <div className={formStyles.group}>
          <VideoUpload
            value={watch('profileVideoUrl') || ''}
            onChange={(url) => setValue('profileVideoUrl', url)}
            label="Profile Video (MP4)"
          />
          <p className="text-xs text-gray-500 mt-1">Video will display in sidebar with red morphing border</p>
        </div>

        <div className={formStyles.group}>
          <ImageUpload
            value={watch('cvUrl') || ''}
            onChange={(url) => setValue('cvUrl', url)}
            label="Resume / CV (PDF)"
            resourceType="raw"
          />
          <p className="text-xs text-gray-500 mt-1">Upload your latest CV (PDF format). This will be linked to the "Download CV" button.</p>
        </div>

        <hr className="my-6 border-gray-700" />

        {/* Social Links */}
        <h3 className="text-xl font-semibold mb-4">Social Links</h3>

        <div className={formStyles.row}>
          <div className={formStyles.group}>
            <label>GitHub URL</label>
            <input {...register('github')} className={formStyles.input} placeholder="https://github.com/username" />
          </div>

          <div className={formStyles.group}>
            <label>LinkedIn URL</label>
            <input {...register('linkedin')} className={formStyles.input} placeholder="https://linkedin.com/in/username" />
          </div>
        </div>

        <div className={formStyles.group}>
          <label>WhatsApp Number</label>
          <input {...register('whatsapp')} className={formStyles.input} placeholder="+254 123 456 789" />
        </div>

        <div className={formStyles.actions}>
          <button type="submit" className={formStyles.saveBtn} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                Saving...
              </>
            ) : (
              <>
                <Save />
                Save Profile
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

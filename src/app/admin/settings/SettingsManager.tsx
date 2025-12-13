'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Globe, Key, Save, Settings, ToggleLeft, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import ImageUpload from '@/components/admin/ImageUpload'
import { PasswordChangeFormData, PasswordChangeSchema, SiteSettingsFormData, SiteSettingsSchema } from '@/lib/schemas'

import formStyles from '@/components/admin/AdminForm.module.css'
import adminStyles from '@/components/admin/Shared.module.css'

import styles from './Settings.module.css'

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'features' | 'seo' | 'account'>('general')
  const [loading, setLoading] = useState(true)

  // Settings Form (Hooks kept same)
  const {
    register: registerSettings,
    handleSubmit: handleSubmitSettings,
    reset: resetSettings,
    setValue: setValueSettings,
    watch: watchSettings,
    formState: { errors: errorsSettings, isSubmitting: isSubmittingSettings }
  } = useForm<SiteSettingsFormData>({
    resolver: zodResolver(SiteSettingsSchema),
    defaultValues: {
      maintenanceMode: false,
      siteUrl: '',
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
      ogImageUrl: '',
      navbarTitle: 'Winter Jackson',
      logoUrl: '',
      footerText: '© 2024 Winter Jackson. All rights reserved.',
      showTestimonials: true,
      showProjects: true,
      showServices: true,
      contactEmail: 'winterjacksonwj@gmail.com',
      googleAnalyticsId: '',
      primaryColor: '#ff0000'
    }
  })

  // Password Form (Hooks kept same)
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: errorsPassword, isSubmitting: isSubmittingPassword }
  } = useForm<PasswordChangeFormData>({
    resolver: zodResolver(PasswordChangeSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings')
      if (res.ok) {
        const data = await res.json()
        // Always reset with data merged with defaults, to ensure form is populated
        // even if DB is empty (first run).
        resetSettings({
            ...data,
            navbarTitle: data.navbarTitle || 'Winter Jackson',
            logoUrl: data.logoUrl || '',
            footerText: data.footerText || '© 2024 Winter Jackson. All rights reserved.',
            showTestimonials: data.showTestimonials ?? true,
            showProjects: data.showProjects ?? true,
            showServices: data.showServices ?? true,
            contactEmail: data.contactEmail || 'winterjacksonwj@gmail.com',
            primaryColor: data.primaryColor || '#ff0000',
            maintenanceMode: data.maintenanceMode || false,
            siteUrl: data.siteUrl || '',
            metaTitle: data.metaTitle || 'Winter Jackson | Software Developer',
            metaDescription: data.metaDescription || 'Portfolio of Winter Jackson',
            metaKeywords: data.metaKeywords || 'software, developer, portfolio',
        })
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const onSettingsSubmit = async (data: SiteSettingsFormData) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update settings')
      toast.success('Settings updated successfully')
    } catch (error) {
      console.error('Failed to update settings:', error)
      toast.error('Failed to update settings')
    }
  }

  const onPasswordSubmit = async (data: PasswordChangeFormData) => {
    try {
      const res = await fetch('/api/auth/update-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Failed to update password')
      toast.success('Password updated successfully')
      resetPassword()
    } catch (error: any) {
      console.error('Failed to update password:', error)
      toast.error(error.message || 'Failed to update password')
    }
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  const tabs = [
    { id: 'general', label: 'General & Identity', icon: Settings },
    { id: 'features', label: 'Features & Toggles', icon: ToggleLeft },
    { id: 'seo', label: 'SEO & Analytics', icon: Globe },
    { id: 'account', label: 'Account', icon: User },
  ]

  return (
    <div className={adminStyles.page}>
      <header className={adminStyles.pageHeader}>
        <h1>Settings</h1>
        <p>Manage site configuration and account</p>
      </header>

      {/* Tabs */}
      <div className={styles.tabsContainer}>
        {tabs.map(tab => (
            <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`${styles.tabBtn} ${activeTab === tab.id ? styles.tabBtnActive : ''} shrink-0`}
            >
            <tab.icon />
            {tab.label}
            </button>
        ))}
      </div>

      <div className={styles.container}>
        {/* Settings Forms */}
        {activeTab !== 'account' && (
             <form onSubmit={handleSubmitSettings(onSettingsSubmit)} className={formStyles.form}>
                
                {/* General Tab */}
                {activeTab === 'general' && (
                    <>
                        <h3 className={styles.sectionTitle}>Site Identity</h3>
                        <div className={styles.row}>
                            <div className={formStyles.group}>
                                <label>Navbar Title</label>
                                <input 
                                    type="text" 
                                    {...registerSettings('navbarTitle')} 
                                    className={formStyles.input} 
                                    placeholder="Winter Jackson"
                                />
                                {errorsSettings.navbarTitle && <span className="error">{errorsSettings.navbarTitle.message}</span>}
                            </div>
                            <div className={formStyles.group}>
                                <label>Primary Color (Hex)</label>
                                <div className={styles.colorPickerGroup}>
                                    <input type="color" {...registerSettings('primaryColor')} className={styles.colorInput} />
                                    <input 
                                        type="text" 
                                        {...registerSettings('primaryColor')} 
                                        className={`${formStyles.input} ${styles.colorTextInput}`} 
                                        placeholder="#ff0000"
                                    />
                                </div>
                                {errorsSettings.primaryColor && <span className="error">{errorsSettings.primaryColor.message}</span>}
                            </div>
                        </div>

                         <div className={formStyles.group}>
                            <label>Footer Text</label>
                            <input 
                                type="text" 
                                {...registerSettings('footerText')} 
                                className={formStyles.input} 
                                placeholder="© 2024 Winter Jackson. All rights reserved."
                            />
                        </div>
                        
                         <div className={formStyles.group}>
                            <label>Contact Email (Public)</label>
                            <input 
                                type="email" 
                                {...registerSettings('contactEmail')} 
                                className={formStyles.input} 
                                placeholder="winterjacksonwj@gmail.com"
                            />
                        </div>

                        <div className={formStyles.group}>
                            <ImageUpload 
                                value={watchSettings('logoUrl') || ''} 
                                onChange={(url) => setValueSettings('logoUrl', url)} 
                                label="Site Logo (Favicon/Navbar)"
                            />
                        </div>

                        <hr className={styles.divider} />
                        
                        <h3 className={styles.sectionTitle}>Configuration</h3>
                        <div className={formStyles.group}>
                            <label className={formStyles.checkboxGroup}>
                                <input type="checkbox" {...registerSettings('maintenanceMode')} className={formStyles.checkbox} />
                                <span className={formStyles.checkboxLabel}>
                                    Enable Maintenance Mode (Hide public site)
                                </span>
                            </label>
                            <p className={styles.helperText}>Only admins will be able to access the site.</p>
                        </div>
                        <div className={formStyles.group}>
                            <label>Site URL (Canonical)</label>
                            <input 
                                type="text" 
                                {...registerSettings('siteUrl')} 
                                className={formStyles.input} 
                                placeholder="https://winterjackson.github.io" 
                            />
                        </div>
                    </>
                )}

                {/* Features Tab */}
                {activeTab === 'features' && (
                    <>
                        <h3 className={styles.sectionTitle}>Feature Toggles</h3>
                        <p className={styles.description}>Control which sections are visible on the public portfolio.</p>
                        
                        <div className={styles.featuresGrid}>
                            {[
                                { name: 'showServices', label: 'Services / What I Do', desc: 'Show the Services section' },
                                { name: 'showProjects', label: 'Projects', desc: 'Show the Portfolio/Projects section' },
                                { name: 'showTestimonials', label: 'Testimonials', desc: 'Show client testimonials' },
                            ].map((feature) => (
                                <div key={feature.name} className={styles.featureCard}>
                                    <label className={styles.featureLabel}>
                                        <input type="checkbox" {...registerSettings(feature.name as any)} className={styles.toggleInput} />
                                        <div className={styles.featureInfo}>
                                            <span className={styles.featureTitle}>{feature.label}</span>
                                            <span className={styles.featureDesc}>{feature.desc}</span>
                                        </div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* SEO Tab */}
                {activeTab === 'seo' && (
                    <>
                        <h3 className={styles.sectionTitle}>Search Engine Optimization</h3>
                         <div className={formStyles.group}>
                            <label>Meta Title</label>
                            <input type="text" {...registerSettings('metaTitle')} className={formStyles.input} />
                            {errorsSettings.metaTitle && <span className="error">{errorsSettings.metaTitle.message}</span>}
                        </div>

                        <div className={formStyles.group}>
                            <label>Meta Description</label>
                            <textarea rows={3} {...registerSettings('metaDescription')} className={formStyles.textarea} />
                            {errorsSettings.metaDescription && <span className="error">{errorsSettings.metaDescription.message}</span>}
                        </div>

                        <div className={formStyles.group}>
                            <label>Meta Keywords</label>
                            <input type="text" {...registerSettings('metaKeywords')} className={formStyles.input} placeholder="comma, separated, keywords" />
                        </div>

                         <div className={formStyles.group}>
                            <ImageUpload 
                                value={watchSettings('ogImageUrl') || ''} 
                                onChange={(url) => setValueSettings('ogImageUrl', url)} 
                                label="OG Social Image"
                            />
                        </div>

                        <hr className={styles.divider} />

                        <h3 className={styles.sectionTitle}>Analytics</h3>
                        <div className={formStyles.group}>
                            <label>Google Analytics ID</label>
                            <input type="text" {...registerSettings('googleAnalyticsId')} className={formStyles.input} placeholder="G-XXXXXXXXXX" />
                        </div>
                    </>
                )}

                <div className="flex justify-end pt-8 border-t border-gray-700 mt-8">
                    <button type="submit" className={formStyles.saveBtn} disabled={isSubmittingSettings}>
                        {isSubmittingSettings ? (
                            <>
                                <span className={styles.loadingSpinner}></span>
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
             </form>
        )}

        {/* Account Tab */}
        {activeTab === 'account' && (
          <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className={formStyles.form}>
            <h3 className={styles.sectionTitle}>Change Password</h3>
            
            <div className={formStyles.group}>
              <label>Current Password</label>
              <input 
                type="password" 
                {...registerPassword('currentPassword')} 
                className={formStyles.input} 
              />
              {errorsPassword.currentPassword && <span className="error">{errorsPassword.currentPassword.message}</span>}
            </div>

            <div className={formStyles.group}>
              <label>New Password</label>
              <input 
                type="password" 
                {...registerPassword('newPassword')} 
                className={formStyles.input} 
              />
              {errorsPassword.newPassword && <span className="error">{errorsPassword.newPassword.message}</span>}
            </div>

            <div className={formStyles.group}>
              <label>Confirm New Password</label>
              <input 
                type="password" 
                {...registerPassword('confirmPassword')} 
                className={formStyles.input} 
              />
              {errorsPassword.confirmPassword && <span className="error">{errorsPassword.confirmPassword.message}</span>}
            </div>

            <div className="flex justify-end pt-4">
              <button type="submit" className={formStyles.saveBtn} disabled={isSubmittingPassword}>
                {isSubmittingPassword ? (
                   <>
                     <span className={styles.loadingSpinner}></span>
                     Updating...
                   </>
                ) : (
                  <>
                    <Key />
                    Update Password
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

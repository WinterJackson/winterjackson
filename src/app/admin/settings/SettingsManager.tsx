'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { AlertTriangle, Database, Eye, EyeOff, Globe, Key, Mail, Save, Settings, ToggleLeft, User } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import ImageUpload from '@/components/admin/ImageUpload'
import { EmailChangeFormData, EmailChangeSchema, EnvVariablesFormData, EnvVariablesSchema, PasswordChangeFormData, PasswordChangeSchema, SiteSettingsFormData, SiteSettingsSchema } from '@/lib/schemas'

import formStyles from '@/components/admin/AdminForm.module.css'
import adminStyles from '@/components/admin/Shared.module.css'

import styles from './Settings.module.css'

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'features' | 'seo' | 'account' | 'env'>('general')
  const [loading, setLoading] = useState(true)

  // Visibility States
  const [showDatabaseUrl, setShowDatabaseUrl] = useState(false)
  const [showAuthSecret, setShowAuthSecret] = useState(false)
  const [showGoogleClientSecret, setShowGoogleClientSecret] = useState(false)
  const [showSmtpPassword, setShowSmtpPassword] = useState(false)
  
  const [showEnvCurrentPassword, setShowEnvCurrentPassword] = useState(false)
  const [showEmailCurrentPassword, setShowEmailCurrentPassword] = useState(false)
  const [showPasswordCurrent, setShowPasswordCurrent] = useState(false)
  const [showPasswordNew, setShowPasswordNew] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)

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
      showResumeDownload: true,
      logoUrl: '',
      footerText: `© ${new Date().getFullYear()} Winter Jackson. All rights reserved.`,
      showTestimonials: true,
      showProjects: true,
      showServices: true,
      contactEmail: 'winterjacksonwj@gmail.com',
      googleAnalyticsId: '',
      primaryColor: '#ff0000'
    }
  })

  // Email Update Form
  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    reset: resetEmail,
    formState: { errors: errorsEmail, isSubmitting: isSubmittingEmail }
  } = useForm<EmailChangeFormData>({
    resolver: zodResolver(EmailChangeSchema),
    defaultValues: {
      newEmail: '',
      currentPassword: ''
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


  // Environment Vars Form
  const {
      register: registerEnv,
      handleSubmit: handleSubmitEnv,
      reset: resetEnv,
      formState: { errors: errorsEnv, isSubmitting: isSubmittingEnv }
  } = useForm<EnvVariablesFormData>({
      resolver: zodResolver(EnvVariablesSchema),
      defaultValues: {
          DATABASE_URL: '',
          NEXTAUTH_URL: '',
          AUTH_SECRET: '',
          GOOGLE_CLIENT_ID: '',
          GOOGLE_CLIENT_SECRET: '',
          NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: '',
          NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: '',
          SMTP_HOST: '',
          SMTP_PORT: '',
          SMTP_USER: '',
          SMTP_PASSWORD: '',
          currentPassword: ''
      }
  })

  useEffect(() => {
    fetchSettings()
    fetchEnvVars()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            showResumeDownload: data.showResumeDownload ?? true,
            logoUrl: data.logoUrl || '',
            footerText: data.footerText || `© ${new Date().getFullYear()} Winter Jackson. All rights reserved.`,
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

  const fetchEnvVars = async () => {
      try {
          const res = await fetch('/api/admin/env')
          if (res.ok) {
              const data = await res.json()
              resetEnv(data)
          }
      } catch (error) {
          console.error('Failed to fetch env vars:', error)
          // Don't show toast here to avoid clutter on load if it fails silently
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

  const onEmailSubmit = async (data: EmailChangeFormData) => {
    try {
      const res = await fetch('/api/auth/update-email', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      const result = await res.json()
      
      if (!res.ok) throw new Error(result.error || 'Failed to update email')
      
      toast.success('Email updated successfully! Please login again.')
      resetEmail()
      
      // Force logout to ensure session consistency
      setTimeout(() => {
        signOut({ callbackUrl: '/admin/login' })
      }, 2000)
      
    } catch (error: unknown) {
      console.error('Failed to update email:', error)
      const message = error instanceof Error ? error.message : 'Failed to update email'
      toast.error(message)
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
    } catch (error: unknown) {
      console.error('Failed to update password:', error)
      const message = error instanceof Error ? error.message : 'Failed to update password'
      toast.error(message)
    }
  }

  const onEnvSubmit = async (data: EnvVariablesFormData) => {
      if (!confirm('Changing environment variables may require a server restart to take full effect. Are you sure you want to proceed?')) {
          return
      }

      try {
          const res = await fetch('/api/admin/env', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
          })
          
          if (!res.ok) throw new Error('Failed to update environment variables')
          
          toast.success('Environment variables updated. Please restart the server if changes do not appear.')
      } catch (error) {
          console.error('Failed to update env vars:', error)
          toast.error('Failed to update environment variables')
      }
  }

  if (loading) {
    return (
      <div className={adminStyles.page}>
        <div className="flex h-64 w-full items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-zinc-800 border-t-[var(--bittersweet-shimmer)] rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-400 text-sm">Loading settings...</p>
          </div>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'general', label: 'General & Identity', icon: Settings },
    { id: 'features', label: 'Features & Toggles', icon: ToggleLeft },
    { id: 'seo', label: 'SEO & Analytics', icon: Globe },
    { id: 'env', label: 'Environment', icon: Database },
    { id: 'account', label: 'Account', icon: User },
  ]

  const logoUrl = watchSettings('logoUrl')

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
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`${styles.tabBtn} ${activeTab === tab.id ? styles.tabBtnActive : ''} shrink-0`}
            >
            <tab.icon />
            {tab.label}
            </button>
        ))}
      </div>

      <div className={styles.container}>
        {/* Settings Forms */}
        {activeTab !== 'account' && activeTab !== 'env' && (
             <form onSubmit={handleSubmitSettings(onSettingsSubmit)} className={formStyles.form}>
                
                {/* General Tab */}
                {activeTab === 'general' && (
                    <>
                        <h3 className={styles.sectionTitle}>Site Identity</h3>
                        <div className={styles.row}>
                            <div className={formStyles.group}>
                                <label className={formStyles.checkboxGroup}>
                                    <input type="checkbox" {...registerSettings('showResumeDownload')} className={formStyles.checkbox} />
                                    <span className={formStyles.checkboxLabel}>
                                        Show &quot;Download CV&quot; Button
                                    </span>
                                </label>
                                <p className={styles.helperText}>Toggle visibility of the resume download button on the public site.</p>
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
                                placeholder={`© ${new Date().getFullYear()} Winter Jackson. All rights reserved.`}
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
                                value={logoUrl || ''} 
                                onChange={(url) => setValueSettings('logoUrl', url)} 
                                label="Site Favicon"
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
                                        <input type="checkbox" {...registerSettings(feature.name as keyof SiteSettingsFormData)} className={styles.toggleInput} />
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

        {/* Environment Tab */}
        {activeTab === 'env' && (
            <form onSubmit={handleSubmitEnv(onEnvSubmit)} className={formStyles.form}>
                <h3 className={styles.sectionTitle}>Environment Variables</h3>
                <div className={styles.alertWarning}>
                    <AlertTriangle size={20} />
                    <p>
                        <strong>Warning:</strong> Modifying these values updates the <code>.env</code> file directly. 
                        Incorrect values can break the application. A server restart is usually required for changes to take effect.
                    </p>
                </div>

                <div className={formStyles.group}>
                    <label>Database URL</label>
                    <div className={styles.passwordWrapper}>
                        <input 
                            type={showDatabaseUrl ? 'text' : 'password'} 
                            {...registerEnv('DATABASE_URL')} 
                            className={`${formStyles.input} ${styles.passwordInput}`} 
                            placeholder="postgresql://..." 
                        />
                         <button
                            type="button"
                            onClick={() => setShowDatabaseUrl(!showDatabaseUrl)}
                            className={styles.passwordToggle}
                        >
                            {showDatabaseUrl ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <div className={formStyles.group}>
                    <label>NextAuth URL</label>
                    <input type="text" {...registerEnv('NEXTAUTH_URL')} className={formStyles.input} placeholder="http://localhost:3000" />
                </div>

                <div className={formStyles.group}>
                    <label>Auth Secret</label>
                     <div className={styles.passwordWrapper}>
                        <input 
                            type={showAuthSecret ? 'text' : 'password'} 
                            {...registerEnv('AUTH_SECRET')} 
                            className={`${formStyles.input} ${styles.passwordInput}`} 
                        />
                         <button
                            type="button"
                            onClick={() => setShowAuthSecret(!showAuthSecret)}
                            className={styles.passwordToggle}
                        >
                            {showAuthSecret ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <hr className={styles.divider} />

                <h3 className={styles.sectionTitle}>Third Party Services</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className={formStyles.group}>
                        <label>Google Client ID</label>
                        <input type="text" {...registerEnv('GOOGLE_CLIENT_ID')} className={formStyles.input} />
                    </div>
                     <div className={formStyles.group}>
                        <label>Google Client Secret</label>
                        <div className={styles.passwordWrapper}>
                            <input 
                                type={showGoogleClientSecret ? 'text' : 'password'} 
                                {...registerEnv('GOOGLE_CLIENT_SECRET')} 
                                className={`${formStyles.input} ${styles.passwordInput}`} 
                            />
                            <button
                                type="button"
                                onClick={() => setShowGoogleClientSecret(!showGoogleClientSecret)}
                                className={styles.passwordToggle}
                            >
                                {showGoogleClientSecret ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className={formStyles.group}>
                        <label>Cloudinary Cloud Name</label>
                        <input type="text" {...registerEnv('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME')} className={formStyles.input} />
                    </div>
                     <div className={formStyles.group}>
                        <label>Cloudinary Upload Preset</label>
                        <input type="text" {...registerEnv('NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET')} className={formStyles.input} />
                    </div>
                </div>

                <hr className={styles.divider} />

                <h3 className={styles.sectionTitle}>Email Configuration (SMTP)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className={formStyles.group}>
                        <label>SMTP Host</label>
                        <input type="text" {...registerEnv('SMTP_HOST')} className={formStyles.input} placeholder="smtp.gmail.com" />
                    </div>
                     <div className={formStyles.group}>
                        <label>SMTP Port</label>
                        <input type="text" {...registerEnv('SMTP_PORT')} className={formStyles.input} placeholder="465" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className={formStyles.group}>
                        <label>SMTP User (Email)</label>
                        <input type="text" {...registerEnv('SMTP_USER')} className={formStyles.input} placeholder="user@gmail.com" />
                    </div>
                     <div className={formStyles.group}>
                        <label>SMTP Password</label>
                        <div className={styles.passwordWrapper}>
                            <input 
                                type={showSmtpPassword ? 'text' : 'password'} 
                                {...registerEnv('SMTP_PASSWORD')} 
                                className={`${formStyles.input} ${styles.passwordInput}`} 
                            />
                            <button
                                type="button"
                                onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                                className={styles.passwordToggle}
                            >
                                {showSmtpPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                </div>

                <hr className={styles.divider} />

                <div className={formStyles.group}>
                    <label>Confirm Changes</label>
                    <div className={styles.passwordWrapper}>
                        <input 
                            type={showEnvCurrentPassword ? 'text' : 'password'} 
                            {...registerEnv('currentPassword')} 
                            className={`${formStyles.input} ${styles.passwordInput}`} 
                            placeholder="Enter your password to save changes"
                        />
                        <button
                            type="button"
                            onClick={() => setShowEnvCurrentPassword(!showEnvCurrentPassword)}
                            className={styles.passwordToggle}
                        >
                            {showEnvCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {errorsEnv.currentPassword && <span className="error">{errorsEnv.currentPassword.message}</span>}
                </div>

                <div className="flex justify-end pt-8 border-t border-gray-700 mt-8">
                    <button type="submit" className={formStyles.saveBtn} disabled={isSubmittingEnv}>
                        {isSubmittingEnv ? (
                            <>
                                <span className={styles.loadingSpinner}></span>
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save />
                                Save Configuration
                            </>
                        )}
                    </button>
                </div>
            </form>
        )}

        {/* Account Tab */}
        {activeTab === 'account' && (
          <div className="flex flex-col gap-10">
            {/* Change Email Form */}
            <form onSubmit={handleSubmitEmail(onEmailSubmit)} className={formStyles.form}>
              <h3 className={styles.sectionTitle}>Change Login Email</h3>
              <p className={styles.description}>Update the email address you use to sign in to the admin panel.</p>
              
              <div className={formStyles.group}>
                <label>New Email Address</label>
                <input 
                  type="email" 
                  {...registerEmail('newEmail')} 
                  className={formStyles.input} 
                  placeholder="new-email@example.com"
                />
                {errorsEmail.newEmail && <span className="error">{errorsEmail.newEmail.message}</span>}
              </div>

              <div className={formStyles.group}>
                <label>Current Password</label>
                <div className={styles.passwordWrapper}>
                    <input 
                    type={showEmailCurrentPassword ? 'text' : 'password'} 
                    {...registerEmail('currentPassword')} 
                    className={`${formStyles.input} ${styles.passwordInput}`} 
                    placeholder="Required to confirm changes"
                    />
                    <button
                        type="button"
                        onClick={() => setShowEmailCurrentPassword(!showEmailCurrentPassword)}
                        className={styles.passwordToggle}
                    >
                        {showEmailCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
                {errorsEmail.currentPassword && <span className="error">{errorsEmail.currentPassword.message}</span>}
              </div>

              <div className="flex justify-end pt-4">
                <button type="submit" className={formStyles.saveBtn} disabled={isSubmittingEmail}>
                  {isSubmittingEmail ? (
                     <>
                       <span className={styles.loadingSpinner}></span>
                       Updating Email...
                     </>
                  ) : (
                    <>
                      <Mail />
                      Update Email
                    </>
                  )}
                </button>
              </div>
            </form>

            <hr className={styles.divider} />

            {/* Change Password Form */}
            <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className={formStyles.form}>
              <h3 className={styles.sectionTitle}>Change Password</h3>
              
              <div className={formStyles.group}>
                <label>Current Password</label>
                <div className={styles.passwordWrapper}>
                    <input 
                    type={showPasswordCurrent ? 'text' : 'password'} 
                    {...registerPassword('currentPassword')} 
                    className={`${formStyles.input} ${styles.passwordInput}`} 
                    />
                    <button
                        type="button"
                        onClick={() => setShowPasswordCurrent(!showPasswordCurrent)}
                        className={styles.passwordToggle}
                    >
                        {showPasswordCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
                {errorsPassword.currentPassword && <span className="error">{errorsPassword.currentPassword.message}</span>}
              </div>

              <div className={formStyles.group}>
                <label>New Password</label>
                <div className={styles.passwordWrapper}>
                    <input 
                    type={showPasswordNew ? 'text' : 'password'} 
                    {...registerPassword('newPassword')} 
                    className={`${formStyles.input} ${styles.passwordInput}`} 
                    />
                    <button
                        type="button"
                        onClick={() => setShowPasswordNew(!showPasswordNew)}
                        className={styles.passwordToggle}
                    >
                        {showPasswordNew ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
                {errorsPassword.newPassword && <span className="error">{errorsPassword.newPassword.message}</span>}
              </div>

              <div className={formStyles.group}>
                <label>Confirm New Password</label>
                <div className={styles.passwordWrapper}>
                    <input 
                    type={showPasswordConfirm ? 'text' : 'password'} 
                    {...registerPassword('confirmPassword')} 
                    className={`${formStyles.input} ${styles.passwordInput}`} 
                    />
                    <button
                        type="button"
                        onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                        className={styles.passwordToggle}
                    >
                        {showPasswordConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
                {errorsPassword.confirmPassword && <span className="error">{errorsPassword.confirmPassword.message}</span>}
              </div>

              <div className="flex justify-end pt-4">
                <button type="submit" className={formStyles.saveBtn} disabled={isSubmittingPassword}>
                  {isSubmittingPassword ? (
                     <>
                       <span className={styles.loadingSpinner}></span>
                       Updating Password...
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
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Lock } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'
import styles from '../login/Login.module.css'

const ResetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

type ResetPasswordData = z.infer<typeof ResetPasswordSchema>

function ResetForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const email = searchParams.get('email')
  
  const [isSuccess, setIsSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  // Validation State
  const [isValidating, setIsValidating] = useState(true)
  const [tokenError, setTokenError] = useState<string | null>(null)

  const {
      register,
      handleSubmit,
      formState: { errors, isSubmitting }
  } = useForm<ResetPasswordData>({
      resolver: zodResolver(ResetPasswordSchema)
  })

  // Validate Token on Load
  useEffect(() => {
     const checkToken = async () => {
         if (!token || !email) {
             setIsValidating(false)
             return // Will be handled by the !token check below
         }

         try {
             const res = await fetch(`/api/auth/reset-password?token=${token}&email=${email}`)
             if (!res.ok) {
                 const data = await res.json()
                 setTokenError(data.error || 'Invalid or expired token')
             }
         } catch (err) {
             setTokenError('Something went wrong')
         } finally {
             setIsValidating(false)
         }
     }
     
     if (token && email) checkToken()
     // eslint-disable-next-line react-hooks/set-state-in-effect
     else setIsValidating(false)
  }, [token, email])

  const onSubmit = async (data: ResetPasswordData) => {
      if (!token || !email) {
          toast.error('Invalid link')
          return
      }

      try {
          const res = await fetch('/api/auth/reset-password', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  token,
                  email,
                  password: data.password
              }),
          })

          const result = await res.json()

          if (!res.ok) throw new Error(result.error || 'Failed to reset password')

          setIsSuccess(true)
          toast.success('Password reset successfully!')
          
          setTimeout(() => {
             router.push('/admin/login') 
          }, 3000)

      } catch (error: unknown) {
          console.error(error)
          const message = error instanceof Error ? error.message : 'Something went wrong'
          toast.error(message)
      }
  }

  if (isValidating) {
      return (
            <div className="text-center py-10">
                <div className="spinner w-8 h-8 border-t-2 border-white rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-zinc-500">Verifying link...</p>
            </div>
      )
  }

  if (!token || !email || tokenError) {
      return (
          <div className="text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20 text-red-500">
                  <Lock size={32} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                 {tokenError === 'Token has expired' ? 'Link Expired' : 'Invalid Link'}
              </h3>
              <p className="text-zinc-400 mb-6 text-sm">
                  {tokenError === 'Token has expired' 
                    ? 'This password reset link has expired. Please request a new one.' 
                    : 'This password reset link is invalid or missing required parameters.'}
              </p>
              <Link href="/admin/forgot-password" className={styles.primaryBtn} style={{ textDecoration: 'none', display: 'inline-block' }}>
                  Request New Link
              </Link>
          </div>
      )
  }

  if (isSuccess) {
      return (
           <div className="text-center">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20 text-green-500">
                    <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Password Reset!</h3>
                <p className="text-zinc-400 mb-6 text-sm">
                    Your password has been successfully updated. You will be redirected to login shortly.
                </p>
                <Link href="/admin/login" className={styles.primaryBtn} style={{ textDecoration: 'none', display: 'flex', justifyContent: 'center' }}>
                    <ArrowLeft size={16} />
                    Go to Login
                </Link>
           </div>
      )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.inputGroup}>
            <label>
                 <Lock size={18} />
                 New Password
            </label>
            <div className={styles.passwordWrapper}>
                <input 
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'} 
                    required
                    placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.passwordToggle}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>
             {errors.password && <div className={styles.error} style={{ marginTop: '10px' }}>{errors.password.message}</div>}
        </div>

        <div className={styles.inputGroup}>
            <label>
                <Lock size={18} />
                Confirm Password
            </label>
            <div className={styles.passwordWrapper}>
                <input 
                    {...register('confirmPassword')}
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                />
                 {/* Re-using the same state for both logic, or could add separate if desired. Usually one toggle for both is fine or per-field. Sticking to one for simplicity as per Login page pattern (which only has one password field). */}
                 {/* To be perfectly UX friendly, I'll add the button here too */}
                 <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.passwordToggle}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>
             {errors.confirmPassword && <div className={styles.error} style={{ marginTop: '10px' }}>{errors.confirmPassword.message}</div>}
        </div>

        <button 
            type="submit" 
            disabled={isSubmitting}
            className={`${styles.loginBtn} ${styles.primaryBtn}`}
        >
            {isSubmitting ? (
                 <>
                   <span className="spinner"></span>
                   Resetting...
                 </>
             ) : 'Set New Password'}
        </button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.card}>
            <div className={styles.header}>
                <h1>New Password</h1>
                <p>Enter your new password below.</p>
            </div>

            <Suspense fallback={<div className="text-center text-zinc-500">Loading...</div>}>
                <ResetForm />
            </Suspense>
        </div>
      </div>
    </div>
  )
}

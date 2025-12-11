'use client'

import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCredentialsLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password')
        setLoading(false)
      } else if (result?.ok) {
        // Use window.location for a hard redirect that properly refreshes cookies
        window.location.href = '/admin'
      } else {
        setError('Login failed. Please try again.')
        setLoading(false)
      }
    } catch {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    await signIn('google', { callbackUrl: '/admin' })
  }

  return (
    <div className="admin-login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>Admin Login</h1>
            <p>Sign in to manage your portfolio</p>
          </div>

          {error && (
            <div className="login-error">
              <ion-icon name="alert-circle-outline"></ion-icon>
              {error}
            </div>
          )}

          <form onSubmit={handleCredentialsLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="email">
                <ion-icon name="mail-outline"></ion-icon>
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                placeholder="admin@example.com"
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <ion-icon name="lock-closed-outline"></ion-icon>
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <button 
              type="submit" 
              className="login-btn primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Signing in...
                </>
              ) : (
                <>
                  <ion-icon name="log-in-outline"></ion-icon>
                  Sign in
                </>
              )}
            </button>
          </form>

          <div className="login-divider">
            <span>or continue with</span>
          </div>

          <button 
            onClick={handleGoogleLogin}
            className="login-btn google"
            disabled={loading}
          >
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>

          <div className="login-footer">
            <Link href="/">
              <ion-icon name="arrow-back-outline"></ion-icon>
              Back to Portfolio
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

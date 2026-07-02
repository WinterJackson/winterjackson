'use client'

import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      padding: '2rem',
      textAlign: 'center',
      color: 'var(--white-2)',
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1.5rem',
      }}>
        <AlertTriangle size={32} color="#ef4444" />
      </div>

      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--white-1)', marginBottom: '0.5rem' }}>
        Something went wrong
      </h2>
      <p style={{ color: 'var(--light-gray)', marginBottom: '2rem', maxWidth: '400px', fontSize: '0.875rem' }}>
        An unexpected error occurred in the admin panel. You can try again or return to the dashboard.
      </p>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={reset}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '8px',
            background: 'var(--bittersweet-shimmer)',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.875rem',
          }}
        >
          <RefreshCw size={16} />
          Try Again
        </button>

        <Link
          href="/admin"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '8px',
            background: 'var(--border-gradient-onyx)',
            border: '1px solid var(--jet)',
            color: 'var(--orange-yellow-crayola)',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
          }}
        >
          <Home size={16} />
          Dashboard
        </Link>
      </div>
    </div>
  )
}

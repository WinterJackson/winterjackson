'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      <h2 className="text-2xl font-bold text-white mb-4">Something went wrong!</h2>
      <p className="text-zinc-400 mb-6 max-w-md">An unexpected error occurred. Please try again or contact support if the issue persists.</p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-[var(--bittersweet-shimmer)] text-white rounded-md hover:opacity-90 transition-all"
      >
        Try again
      </button>
    </div>
  )
}

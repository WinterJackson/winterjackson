import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      <h2 className="text-3xl font-bold text-white mb-4">404 - Page Not Found</h2>
      <p className="text-zinc-400 mb-6 max-w-md">We couldn&apos;t find the page you were looking for.</p>
      <Link 
        href="/"
        className="px-4 py-2 bg-[var(--bittersweet-shimmer)] text-white rounded-md hover:opacity-90 transition-all"
      >
        Return Home
      </Link>
    </div>
  )
}

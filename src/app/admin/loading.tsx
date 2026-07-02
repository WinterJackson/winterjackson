export default function AdminLoading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-[var(--eerie-black-1)]">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-zinc-800 border-t-[var(--bittersweet-shimmer)] rounded-full animate-spin"></div>
        <p className="mt-4 text-[var(--light-gray)] text-sm">Loading admin area...</p>
      </div>
    </div>
  )
}

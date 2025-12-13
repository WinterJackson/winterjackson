import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Dashboard from './Dashboard'

export default async function AdminDashboardPage() {
  const session = await auth()
  
  if (!session) {
    redirect('/admin/login')
  }

  return <Dashboard session={session} />
}

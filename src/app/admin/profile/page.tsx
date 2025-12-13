import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ProfileManager from './ProfileManager'

export default async function AdminProfilePage() {
  const session = await auth()
  
  if (!session) redirect('/admin/login')

  return <ProfileManager />
}

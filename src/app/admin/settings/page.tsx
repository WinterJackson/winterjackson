import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import SettingsManager from './SettingsManager'

export default async function AdminSettingsPage() {
  const session = await auth()
  if (!session) redirect('/admin/login')
  return <SettingsManager />
}

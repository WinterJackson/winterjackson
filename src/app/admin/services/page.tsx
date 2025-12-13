import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ServicesManager from './ServicesManager'

export default async function AdminServicesPage() {
  const session = await auth()
  if (!session) redirect('/admin/login')
  return <ServicesManager />
}

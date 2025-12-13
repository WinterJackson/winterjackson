import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ClientsManager from './ClientsManager'

export default async function AdminClientsPage() {
  const session = await auth()
  if (!session) redirect('/admin/login')
  return <ClientsManager />
}

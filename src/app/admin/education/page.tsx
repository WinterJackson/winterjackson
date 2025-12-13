import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import EducationManager from './EducationManager'

export default async function AdminEducationPage() {
  const session = await auth()
  if (!session) redirect('/admin/login')
  return <EducationManager />
}

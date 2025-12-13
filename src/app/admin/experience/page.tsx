import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ExperienceManager from './ExperienceManager'

export default async function AdminExperiencePage() {
  const session = await auth()
  if (!session) redirect('/admin/login')
  return <ExperienceManager />
}

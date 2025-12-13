import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import SkillsManager from './SkillsManager'

export default async function AdminSkillsPage() {
  const session = await auth()
  if (!session) redirect('/admin/login')
  return <SkillsManager />
}

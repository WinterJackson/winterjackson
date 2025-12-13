import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ProjectsManager from './ProjectsManager'

export default async function AdminProjectsPage() {
  const session = await auth()
  
  if (!session) {
    redirect('/admin/login')
  }

  return <ProjectsManager />
}

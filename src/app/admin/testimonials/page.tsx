import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import TestimonialsManager from './TestimonialsManager'

export default async function AdminTestimonialsPage() {
  const session = await auth()
  if (!session) redirect('/admin/login')
  return <TestimonialsManager />
}

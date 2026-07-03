import { getReferees } from '@/app/actions/referees'
import RefereesManager from './RefereesManager'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Manage Referees | Admin Dashboard',
}

export const dynamic = 'force-dynamic'

export default async function RefereesPage() {
  const referees = await getReferees()
  
  return <RefereesManager initialReferees={referees} />
}

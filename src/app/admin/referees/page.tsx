import { getReferees } from '@/app/actions/referees'
import RefereesManager from './RefereesManager'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Manage Referees | Admin Dashboard',
}

export const dynamic = 'force-dynamic'

export default async function RefereesPage() {
  const referees = await getReferees()
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Referees</h1>
        <p className="text-gray-400">Manage your referees for your resume.</p>
      </div>
      
      <RefereesManager initialReferees={referees} />
    </div>
  )
}

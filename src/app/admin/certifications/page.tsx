import { getCertifications } from '@/app/actions/certifications'
import CertificationsManager from './CertificationsManager'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Manage Certifications | Admin Dashboard',
}

export const dynamic = 'force-dynamic'

export default async function CertificationsPage() {
  const certifications = await getCertifications()
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Certifications</h1>
        <p className="text-gray-400">Manage your certifications for your resume.</p>
      </div>
      
      <CertificationsManager initialCertifications={certifications} />
    </div>
  )
}

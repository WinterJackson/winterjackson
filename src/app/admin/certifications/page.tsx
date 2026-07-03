import { getCertifications } from '@/app/actions/certifications'
import CertificationsManager from './CertificationsManager'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Manage Certifications | Admin Dashboard',
}

export const dynamic = 'force-dynamic'

export default async function CertificationsPage() {
  const certifications = await getCertifications()
  
  return <CertificationsManager initialCertifications={certifications} />
}

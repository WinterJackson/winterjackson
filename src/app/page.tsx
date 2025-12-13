import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ClientHome from './ClientHome'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const session = await auth()
  const settings = await prisma.siteSettings.findFirst()

  if (settings?.maintenanceMode && !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1e1e1f] text-white p-4">
        <div className="text-center max-w-md">
          <h1 className="text-4xl font-bold mb-4 text-[#FFDB70]">Under Maintenance</h1>
          <p className="text-gray-300">
            I'm currently updating my portfolio. Please check back soon.
          </p>
        </div>
      </div>
    )
  }

  /* 
    Fetch all data in parallel for better performance 
  */
  const [
    profile, 
    projects, 
    services, 
    experiences, 
    educations, 
    skills, 
    testimonials, 
    clients
  ] = await Promise.all([
    prisma.profile.findFirst({ where: { id: 'default-profile' } }).then(p => p || prisma.profile.findFirst()),
    prisma.project.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } }),
    prisma.service.findMany({ orderBy: { order: 'asc' } }),
    prisma.experience.findMany({ orderBy: { order: 'asc' } }),
    prisma.education.findMany({ orderBy: { order: 'asc' } }),
    prisma.skill.findMany({ orderBy: { order: 'asc' } }),
    prisma.testimonial.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } }),
    prisma.client.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } })
  ])

  // Optionally fetch settings if needed for layout metadata, 
  // though typically metadata is handled in layout.tsx or generateMetadata.
  // For ClientHome, we might pass it if it needs to display social links etc.

  if (!profile) {
    return <div>Loading... (Please run seed)</div>
  }

  return (
    <ClientHome
      profile={profile}
      projects={projects}
      services={services}
      experiences={experiences}
      educations={educations}
      skills={skills}
      testimonials={testimonials}
      clients={clients}
      settings={settings}
    />
  )
}

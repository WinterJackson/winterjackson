'use client'

import Navbar from '@/components/Navbar'
import About from '@/components/sections/About'
import Contact from '@/components/sections/Contact'
import Portfolio from '@/components/sections/Portfolio'
import Resume from '@/components/sections/Resume'
import Services from '@/components/sections/Services'
import Sidebar from '@/components/Sidebar'
import type { Client, Education, Experience, Profile, Project, Service, SiteSettings, Skill, Testimonial } from '@prisma/client'
import { useEffect, useState } from 'react'

interface ClientHomeProps {
  profile: Profile
  projects: Project[]
  services: Service[]
  experiences: Experience[]
  educations: Education[]
  skills: Skill[]
  testimonials: Testimonial[]
  clients: Client[]
  settings: SiteSettings | null
}

export default function ClientHome({ 
  profile, 
  projects, 
  services, 
  experiences, 
  educations, 
  skills, 
  testimonials,
  clients,
  settings
}: ClientHomeProps) {
  const [activePage, setActivePage] = useState('services')
  const [currentYear, setCurrentYear] = useState(2024)

  useEffect(() => {
    setCurrentYear(new Date().getFullYear())
  }, [])

  // Filter sections based on settings
  // Note: 'about' page usually contains personal details + testimonials + skills
  // 'services' page usually contains "What I Do" + Clients
  // 'portfolio' is Projects
  // 'resume' is Experience + Education
  
  return (
    <main>
      <div className="wrap">
        <Sidebar profile={profile} />
        <div className="separator2"></div>

        <div className="main-content fade-in">
          <Navbar 
            activePage={activePage} 
            setActivePage={setActivePage} 
            settings={settings} // Pass settings for dynamic Nav Title/Logo if needed
          />

          {/* Services Section (What I Do + Clients) */}
          {settings?.showServices !== false && (
             <Services 
                isActive={activePage === 'services'} 
                services={services} 
                clients={clients}
             />
          )}

          {/* About Section */}
          <About 
            isActive={activePage === 'about'} 
            profile={profile}
            testimonials={settings?.showTestimonials !== false ? testimonials : []}
            services={services}
            skills={skills}
          />

          {/* Resume Section */}
          <Resume 
            isActive={activePage === 'resume'} 
            experiences={experiences}
            educations={educations}
            skills={skills}
            profile={profile}
            showDownloadBtn={settings?.showResumeDownload ?? true}
          />

          {/* Portfolio/Projects Section */}
          {settings?.showProjects !== false && (
            <Portfolio 
                isActive={activePage === 'portfolio'} 
                projects={projects}
            />
          )}

          {/* Contact Section */}
          <Contact 
            isActive={activePage === 'contact'} 
            profile={profile}
          />
        </div>
      </div>

      <div className="copyright">
        <div className="cc-text">
           {settings?.footerText ? (
              <p>{settings.footerText.replace('{year}', currentYear.toString())}</p>
           ) : (
              <p>All Rights Reserved. &copy; <em id="currentYear">{currentYear}</em> | {profile.name}</p>
           )}
        </div>
      </div>
    </main>
  )
}

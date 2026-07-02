'use client'

import { Education, Experience, Profile, Skill, Certification, Referee } from '@prisma/client'
import { GraduationCap, Briefcase, BadgeCheck, UserCheck, Terminal } from 'lucide-react'

interface ResumeProps {
  isActive: boolean
  experiences: Experience[]
  educations: Education[]
  skills: Skill[]
  certifications: Certification[]
  referees: Referee[]
  profile: Profile
  showDownloadBtn?: boolean
}

const getDownloadUrl = (url: string | null | undefined) => {
  if (!url) return "/docs/Winter Jackson CV.pdf"
  if (url.includes('cloudinary.com')) {
    // Insert fl_attachment into the cloudinary URL to force download
    return url.replace('/upload/', '/upload/fl_attachment/')
  }
  return url
}

export default function Resume({ isActive, experiences, educations, skills, certifications, referees, profile, showDownloadBtn = true }: ResumeProps) {
  // Group skills by category
  const skillsByCategory = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = []
    }
    acc[skill.category].push(skill.name)
    return acc
  }, {} as Record<string, string[]>)

  return (
    <article className={`resume ${isActive ? 'active' : ''}`} data-page="resume">
      <header>
        <h2 className="h2 article-title">Resume</h2>
      </header>

      {/* Education */}
      <section className="hidden show timeline">
        <div className="title-wrapper">
          <div className="icon-box">
            <GraduationCap />
          </div>
          <h3 className="h3">Education</h3>
        </div>

        <ul className="timeline-list">
          {educations.map((edu) => (
            <li key={edu.id} className="timeline-item">
              <h4 className="h4 timeline-item-title">{edu.institution}</h4>
              <span>{edu.field} | {edu.startDate} - {edu.endDate}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Experience */}
      <section className="hidden show timeline">
        <div className="title-wrapper">
          <div className="icon-box">
            <Briefcase />
          </div>
          <h3 className="h3">Experience</h3>
        </div>

        <ul className="timeline-list">
          {experiences.map((exp) => {
            const lines = exp.description ? exp.description.split('\n').filter(line => line.trim()) : []
            const responsibilities = lines.filter(line => !line.trim().startsWith('KEY ACHIEVEMENT:'))
            const achievement = lines.find(line => line.trim().startsWith('KEY ACHIEVEMENT:'))

            return (
              <li key={exp.id} className="timeline-item">
                <h4 className="h4 timeline-item-title">{exp.jobTitle}</h4>
                <span className="timeline-company" style={{ fontWeight: 'bold', color: 'var(--white-2)' }}>{exp.company}{exp.location ? ` — ${exp.location}` : ''}</span>
                <span>{exp.startDate} — {exp.endDate || 'Current'}</span>
                {responsibilities.length > 0 && (
                  <div className="timeline-text">
                    <p style={{ marginBottom: '4px' }}>{responsibilities[0]}</p>
                    <ul style={{ 
                      listStyleType: 'disc', 
                      paddingLeft: '20px', 
                      marginTop: '8px',
                      color: 'var(--light-gray)'
                    }}>
                      {responsibilities.slice(1).map((line, index) => (
                        <li key={index} style={{ marginBottom: '5px', display: 'list-item' }}>{line.trim()}</li>
                      ))}
                    </ul>
                    {achievement && (
                      <div style={{ marginTop: '10px' }}>
                        <p style={{ fontWeight: 500, marginBottom: '4px' }}>Key Achievement:</p>
                        <p style={{ color: 'var(--light-gray)', paddingLeft: '20px' }}>
                          {achievement.replace('KEY ACHIEVEMENT:', '').trim()}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </section>

      {/* Certifications */}
      {certifications.length > 0 && (
        <section className="hidden show timeline">
          <div className="title-wrapper">
            <div className="icon-box">
              <BadgeCheck />
            </div>
            <h3 className="h3">Certifications</h3>
          </div>

          <ul className="timeline-list">
            {certifications.map((cert) => (
              <li key={cert.id} className="timeline-item">
                <h4 className="h4 timeline-item-title">{cert.name}</h4>
                <span className="timeline-company">{cert.issuer}</span>
                {cert.date && <span>{cert.date}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Referees */}
      {referees.length > 0 && (() => {
        const mid = Math.ceil(referees.length / 2);
        const col1 = referees.slice(0, mid);
        const col2 = referees.slice(mid);

        return (
          <section className="hidden show timeline">
            <div className="title-wrapper">
              <div className="icon-box">
                <UserCheck />
              </div>
              <h3 className="h3">Referees</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
              <ul className="timeline-list">
                {col1.map((ref) => (
                  <li key={ref.id} className="timeline-item">
                    <h4 className="h4 timeline-item-title">{ref.name}</h4>
                    <span className="timeline-company" style={{ textTransform: 'capitalize' }}>{ref.role} - {ref.company}</span>
                    <span style={{ textTransform: 'none', display: 'block', marginTop: '4px', fontStyle: 'italic', opacity: 0.8 }}>
                      Contact upon request
                    </span>
                  </li>
                ))}
              </ul>
              {col2.length > 0 && (
                <ul className="timeline-list">
                  {col2.map((ref) => (
                    <li key={ref.id} className="timeline-item">
                      <h4 className="h4 timeline-item-title">{ref.name}</h4>
                      <span className="timeline-company" style={{ textTransform: 'capitalize' }}>{ref.role} - {ref.company}</span>
                      <span style={{ textTransform: 'none', display: 'block', marginTop: '4px', fontStyle: 'italic', opacity: 0.8 }}>
                        Contact upon request
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        );
      })()}

      {/* Download CV */}
      {showDownloadBtn && (
        <div className="download-div">
          <a href={getDownloadUrl(profile.cvUrl)} target="_blank" rel="noopener noreferrer" download="Winter Jackson CV" className="download-btn">
            Download CV
          </a>
        </div>
      )}

      {/* Skills */}
      <section className="hidden show skill">
        <div className="title-wrapper">
          <div className="icon-box">
            <Terminal />
          </div>
          <h3 className="h3 skills-title">Skills</h3>
        </div>
        <div className="skills-wrap" style={{ display: 'block', margin: 0 }}>
          <div className="skills-show content-card" style={{ padding: '30px', width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
            {Object.entries(skillsByCategory).map(([category, skillNames]) => (
              <div key={category}>
                <p style={{ fontSize: '13px', fontWeight: 'normal', marginBottom: '6px', color: 'var(--light-gray-70)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {category}
                </p>
                <p style={{ fontSize: '14px', fontWeight: 'normal', color: 'var(--light-gray)', lineHeight: '1.6' }}>
                  {skillNames.join(' | ')}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </article>
  )
}

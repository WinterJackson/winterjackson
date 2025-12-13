'use client'

import { Education, Experience, Profile, Skill } from '@prisma/client'
import { Book } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface ResumeProps {
  isActive: boolean
  experiences: Experience[]
  educations: Education[]
  skills: Skill[]
  profile: Profile
}

export default function Resume({ isActive, experiences, educations, skills, profile }: ResumeProps) {
  const [typedText, setTypedText] = useState('')
  const [shouldType, setShouldType] = useState(false)
  const skillsShowRef = useRef<HTMLDivElement>(null)

  // Construct skills list string from props
  const skillsList = skills.map(s => s.name).join(' | ') + '.'

  useEffect(() => {
    if (!isActive) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShouldType(true)
          observer.disconnect()
        }
      },
      { threshold: 0.7 }
    )

    if (skillsShowRef.current) {
      observer.observe(skillsShowRef.current)
    }

    return () => observer.disconnect()
  }, [isActive])

  useEffect(() => {
    if (!shouldType) return

    let i = 0
    const timer = setInterval(() => {
      if (i < skillsList.length) {
        setTypedText(skillsList.slice(0, i + 1))
        i++
      } else {
        clearInterval(timer)
      }
    }, 50)

    return () => clearInterval(timer)
  }, [shouldType, skillsList])

  return (
    <article className={`resume ${isActive ? 'active' : ''}`} data-page="resume">
      <header>
        <h2 className="h2 article-title">Resume</h2>
      </header>

      {/* Education */}
      <section className="hidden show timeline">
        <div className="title-wrapper">
          <div className="icon-box">
            <Book />
          </div>
          <h3 className="h3">Education</h3>
        </div>

        <ul className="timeline-list">
          {educations.map((edu) => (
            <li key={edu.id} className="hidden show timeline-item">
              <h4 className="h4 hidden show timeline-item-title">{edu.institution}</h4>
              <span>{edu.field} | {edu.startDate} - {edu.endDate}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Experience */}
      <section className="hidden show timeline">
        <div className="title-wrapper">
          <div className="icon-box">
            <Book />
          </div>
          <h3 className="h3">Experience</h3>
        </div>

        <ul className="timeline-list">
          {experiences.map((exp) => (
            <li key={exp.id} className="timeline-item">
              <h4 className="h4 timeline-item-title">{exp.jobTitle}</h4>
              <span className="timeline-company">{exp.company}</span>
              <span>{exp.startDate} — {exp.endDate || 'Current'}</span>
              {exp.description && (
                <div className="timeline-text">
                  <p style={{ marginBottom: '8px', fontWeight: 500 }}>Key Responsibilities:</p>
                  <ul style={{ 
                    listStyleType: 'disc', 
                    paddingLeft: '20px', 
                    marginTop: '8px',
                    color: 'var(--light-gray)'
                  }}>
                    {exp.description.split('\n').filter(line => line.trim()).map((line, index) => (
                      <li key={index} style={{ marginBottom: '5px', display: 'list-item' }}>{line.trim()}</li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Download CV */}
      <div className="download-div">
        <a href={profile.cvUrl || "/docs/Winter Jackson CV.pdf"} download="Winter Jackson CV" className="download-btn">
          Download CV
        </a>
      </div>

      {/* Skills */}
      <section className="hidden show skill">
        <div className="title-wrapper">
          <div className="icon-box">
            <Book />
          </div>
          <h3 className="h3 skills-title">Skills</h3>
        </div>
        <div className="skills-wrap">
          <ul className="skills-list content-card">
            {skills.map((skill) => (
              <li key={skill.id} className="skills-item">
                <div className="title-wrapper">
                  <h5 className="h5">{skill.name}</h5>
                  <data value={skill.percentage}>{skill.percentage}%</data>
                </div>
                <div className="skill-progress-bg">
                  <div className="skill-progress-fill" style={{ width: `${skill.percentage}%` }}></div>
                </div>
              </li>
            ))}
          </ul>

          <div className="skills-show content-card" ref={skillsShowRef}>
            <p className="show-list" style={{ display: shouldType ? 'inline-block' : 'none' }}>
              : {typedText}
            </p>
          </div>
        </div>
      </section>
    </article>
  )
}

import { Profile, Service, Skill, Testimonial } from '@prisma/client'
import { Linkedin, X } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

import dynamic from 'next/dynamic'
import { languagesData, toolsData } from '@/lib/constants'

const TestimonialModal = dynamic(() => import('./TestimonialModal'), { ssr: false })

interface AboutProps {
  isActive: boolean
  profile: Profile
  testimonials: Testimonial[]
  services: Service[]
  skills: Skill[]
}

export default function About({ isActive, profile, testimonials, services, skills }: AboutProps) {
  const [activeModal, setActiveModal] = useState<Testimonial | null>(null)

  // Filter Services
  const whatIDo = services.filter(s => s.category === 'service' || !s.category)
  const personalVentures = services.filter(s => s.category === 'venture')

  return (
    <article className={`about ${isActive ? 'active' : ''}`} data-page="about">
      <header>
        <h2 className="h2 article-title">About me</h2>
      </header>

      <section className="hidden show about-text mb-8">
        <h3 className="text-sm font-semibold text-[var(--light-gray-70)] uppercase tracking-wider mb-4 border-b border-[var(--jet)] pb-2 inline-block">Bio</h3>
        <div dangerouslySetInnerHTML={{ 
          __html: profile.bio.replace(/\n/g, '<br/>')
        }} />
      </section>

      {profile.professionalAmbition && (
        <section className="hidden show about-text mb-10">
          <h3 className="text-sm font-semibold text-[var(--light-gray-70)] uppercase tracking-wider mb-4 border-b border-[var(--jet)] pb-2 inline-block">Professional Ambition</h3>
          <div dangerouslySetInnerHTML={{ 
            __html: profile.professionalAmbition.replace(/\n/g, '<br/>')
          }} />
        </section>
      )}

      {/* What I Do */}
      <section className="hidden show service">
        <h3 className="h3 service-title">What I Do</h3>
        <ul className="service-list">
          {whatIDo.map((item) => (
            <li key={item.id} className="service-item">
              <div className="service-icon-box">
                <picture>
                  <Image src={item.iconUrl} alt={`${item.title} icon`} width={40} height={40} />
                </picture>
              </div>
              <div className="service-content-box">
                <h4 className="h4 service-item-title">{item.title}</h4>
                <p className="service-item-text">{item.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Languages & Tools */}
      <section className="hidden languages show">
        <h3 className="h3 languages-title">Languages &amp; Other Tools</h3>
        <div className="lang-text">
          <p>Below are some of the Languages and web development tools am well conversant with.</p>
        </div>
        <div className="slider-wrap">
          <div style={{ position: 'relative', width: '100%', minWidth: 0 }}>
            <div className="slider-title1" style={{ position: 'absolute', left: 0, top: '16px', zIndex: 10 }}>
              <p>Languages</p>
            </div>
            <div className="slider-lang">
              <div style={{ minWidth: '85px', flexShrink: 0 }}></div>
              <div style={{ display: 'flex', gap: '10px', position: 'relative' }}>
                {[0, 1].map((wrapIndex) => (
                  <div key={wrapIndex} className="languages-items-wrap">
                    {languagesData.map((lang, index) => (
                      <div key={index} className="slider-item">
                        <div className="slider-img-container">
                          <Image 
                            src={lang.icon} 
                            alt={`${lang.name} logo`} 
                            width={60} 
                            height={60}
                            style={{ objectFit: 'contain', width: '60px', height: '60px' }}
                          />
                        </div>
                        <p>{lang.name}</p>
                      </div>
                    ))}
                  </div>
                ))}
                {/* Absolutely positioned 3rd copy to perfectly fill the visual void caused by CSS translation without extending the native scrollbar bounds */}
                <div className="languages-items-wrap" style={{ position: 'absolute', top: 0, left: 'calc(100% + 10px)' }}>
                  {languagesData.map((lang, index) => (
                    <div key={`abs-${index}`} className="slider-item">
                      <div className="slider-img-container">
                        <Image 
                          src={lang.icon} 
                          alt={`${lang.name} logo`} 
                          width={60} 
                          height={60}
                          style={{ objectFit: 'contain', width: '60px', height: '60px' }}
                        />
                      </div>
                      <p>{lang.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ position: 'relative', width: '100%', minWidth: 0 }}>
            <div className="slider-title2" style={{ position: 'absolute', left: 0, top: '16px', zIndex: 10 }}>
              <p>Other tools</p>
            </div>
            <div className="slider-others">
              <div style={{ minWidth: '85px', flexShrink: 0 }}></div>
              <div style={{ display: 'flex', gap: '10px', position: 'relative' }}>
                {[0, 1].map((wrapIndex) => (
                  <div key={wrapIndex} className="others-items-wrap">
                    {toolsData.map((tool, index) => (
                      <div key={index} className="slider-item">
                        <div className="slider-img-container">
                           <Image 
                              src={tool.icon} 
                              alt={`${tool.name} logo`} 
                              width={60} 
                              height={60}
                              style={{ objectFit: 'contain', width: '60px', height: '60px' }}
                            />
                        </div>
                        <p>{tool.name}</p>
                      </div>
                    ))}
                  </div>
                ))}
                <div className="others-items-wrap" style={{ position: 'absolute', top: 0, left: 'calc(100% + 10px)' }}>
                  {toolsData.map((tool, index) => (
                    <div key={`abs-${index}`} className="slider-item">
                      <div className="slider-img-container">
                         <Image 
                            src={tool.icon} 
                            alt={`${tool.name} logo`} 
                            width={60} 
                            height={60}
                            style={{ objectFit: 'contain', width: '60px', height: '60px' }}
                          />
                      </div>
                      <p>{tool.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Personal Ventures */}
      <section className="hidden show service">
        <h3 className="h3 service-title">Personal Ventures</h3>
        <ul className="service-list">
          {personalVentures.map((item) => (
            <li key={item.id} className="service-item">
              <div className="service-icon-box">
                <picture>
                  <Image src={item.iconUrl} alt={`${item.title} icon`} width={40} height={40} />
                </picture>
              </div>
              <div className="service-content-box">
                <h4 className="h4 service-item-title">{item.title}</h4>
                <p className="service-item-text">{item.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Testimonials */}
      <section className="hidden show testimonials">
        <h3 className="h3 testimonials-title">Testimonials</h3>
        <ul className="testimonials-list has-scrollbar">
          {testimonials.map((testimonial) => (
            <li key={testimonial.id} className="testimonials-item">
              <div
                className="content-card"
                onClick={() => setActiveModal(testimonial)}
                data-testimonials-item
              >
                <figure className="testimonials-avatar-box">
                  {testimonial.avatarUrl && (
                    <Image
                      src={testimonial.avatarUrl}
                      alt={testimonial.name}
                      width={60}
                      height={60}
                      data-testimonials-avatar
                    />
                  )}
                </figure>

                <div className="testimonial-name-wrap">
                  <h4 className="h4 testimonials-item-title" data-testimonials-title>
                    {testimonial.name}
                    <span>{testimonial.role}</span>
                  </h4>
                </div>

                <div className="testimonials-text" data-testimonials-text>
                    {testimonial.linkedinUrl && (
                        <a className="t-text" href={testimonial.linkedinUrl} target="_blank" rel="noopener noreferrer">
                            <span>LinkedIn</span>
                            <Linkedin />
                        </a>
                    )}
                  <p>{testimonial.text.replace(/"/g, '')}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Testimonials Modal */}
      {activeModal && (
        <TestimonialModal 
          activeModal={activeModal} 
          onClose={() => setActiveModal(null)} 
        />
      )}
    </article>
  )
}

import { DynamicIcon } from '@/lib/icons'
import { Profile, Service, Skill, Testimonial } from '@prisma/client'
import { Linkedin, X } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

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

  // Filter Skills
  const myLanguages = skills.filter(s => ['frontend', 'backend', 'database'].includes(s.category.toLowerCase()))
  const myTools = skills.filter(s => ['tools', 'other'].includes(s.category.toLowerCase()))

  return (
    <article className={`about ${isActive ? 'active' : ''}`} data-page="about">
      <header>
        <h2 className="h2 article-title">About me</h2>
      </header>

      <section className="hidden show about-text">
        <div dangerouslySetInnerHTML={{ __html: profile.bio.replace(/\n/g, '<br/>') }} />
      </section>

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
          <div className="slider-lang">
            <div className="slider-title1">
              <p>Languages</p>
            </div>
            {[0, 1].map((wrapIndex) => (
              <div key={wrapIndex} className="languages-items-wrap">
                {myLanguages.map((lang, index) => (
                  <div key={index} className="slider-item">
                    <div className="slider-img-container">
                      {lang.iconUrl ? (
                         lang.iconUrl.startsWith('http') || lang.iconUrl.startsWith('/') ? (
                            <Image 
                              src={lang.iconUrl} 
                              alt={`${lang.name} logo`} 
                              width={60} 
                              height={60}
                              unoptimized
                              style={{ objectFit: 'contain', width: '60px', height: '60px' }}
                            />
                         ) : (
                            <DynamicIcon name={lang.iconUrl} size={60} />
                         )
                      ) : (
                         <div className="text-xl font-bold">{lang.name.substring(0, 2)}</div>
                      )}
                    </div>
                    <p>{lang.name}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="slider-others">
            <div className="slider-title2">
              <p>Other tools</p>
            </div>
            {[0, 1].map((wrapIndex) => (
              <div key={wrapIndex} className="others-items-wrap">
                {myTools.map((tool, index) => (
                  <div key={index} className="slider-item">
                    <div className="slider-img-container">
                      {tool.iconUrl ? (
                         tool.iconUrl.startsWith('http') || tool.iconUrl.startsWith('/') ? (
                            <Image 
                              src={tool.iconUrl} 
                              alt={`${tool.name} logo`} 
                              width={60} 
                              height={60}
                              unoptimized
                              style={{ objectFit: 'contain', width: '60px', height: '60px' }}
                            />
                         ) : (
                            <DynamicIcon name={tool.iconUrl} size={60} />
                         )
                      ) : (
                         <div className="text-xl font-bold">{tool.name.substring(0, 2)}</div>
                      )}
                    </div>
                    <p>{tool.name}</p>
                  </div>
                ))}
              </div>
            ))}
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
        <div className="modal-container active" data-modal-container>
          <div className="overlay active" onClick={() => setActiveModal(null)} data-overlay></div>
          <section className="hidden show testimonials-modal">
            <button
              className="modal-close-btn"
              onClick={() => setActiveModal(null)}
              data-modal-close-btn
            >
              <X />
            </button>

            <div className="modal-img-wrapper">
              <figure className="modal-avatar-box">
                {activeModal.avatarUrl && (
                  <Image
                    src={activeModal.avatarUrl}
                    alt={activeModal.name}
                    width={80}
                    height={80}
                    data-modal-img
                  />
                )}
              </figure>
            </div>

            <div className="modal-content">
              <div className="testimonial-name-wrap">
                <h4 className="h3 modal-title" data-modal-title>{activeModal.name}</h4>
              </div>
              <div data-modal-text>
                <p>{activeModal.text.replace(/"/g, '')}</p>
              </div>
            </div>
          </section>
        </div>
      )}
    </article>
  )
}

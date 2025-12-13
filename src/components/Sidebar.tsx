'use client'

import { Profile } from '@prisma/client'
import { ChevronDown, Github, Linkedin, Mail, MapPin, Phone, Smartphone } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

interface SidebarProps {
  profile: Profile
}

export default function Sidebar({ profile }: SidebarProps) {
  const [isActive, setIsActive] = useState(false)

  return (
    <aside className={`sidebar slide-in-right ${isActive ? 'active' : ''}`} data-sidebar>
      <div className="sidebar-info">
        {/* Avatar Section */}
        <div className="container">
          <div className="box">
            <div className="spin-container">
              <div className="shape">
                <div className="avatar-box">
                  {profile.profileVideoUrl ? (
                    <video
                      src={profile.profileVideoUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '30px'
                      }}
                    />
                  ) : profile.avatarUrl ? (
                    <Image
                      src={profile.avatarUrl}
                      alt={profile.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 300px"
                      priority
                      style={{ objectFit: 'cover', borderRadius: '30px' }}
                    />
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="info-content">
          <h1 className="name" title={profile.name}>{profile.name}.</h1>
          <p className="title">{profile.title}.</p>
        </div>

        <button
          className="info_more-btn"
          onClick={() => setIsActive(!isActive)}
          data-sidebar-btn
        >
          <span>Show Contacts</span>
          <ChevronDown />
        </button>
      </div>

      <div className="sidebar-info_more">
        <div className="separator"></div>

        <ul className="contacts-list">
          {/* Email */}
          <li className="contact-item">
            <div className="icon-box">
              <Mail />
            </div>
            <div className="contact-info">
              <p className="contact-title">E-mail</p>
              <a href={`mailto:${profile.email}`} className="contact-link">
                {profile.email}
              </a>
            </div>
          </li>

          {/* Phone */}
          <li className="contact-item">
            <div className="icon-box">
              <Smartphone />
            </div>
            <div className="contact-info">
              <p className="contact-title">Phone</p>
              <a href={`tel:${profile.phone.replace(/\s+/g, '')}`} className="contact-link">
                {profile.phone}
              </a>
            </div>
          </li>

          {/* Alt Phone */}
          {profile.altPhone && (
            <li className="contact-item">
            <div className="icon-box">
                <Phone />
              </div>
              <div className="contact-info">
                <p className="contact-title">Alt. Phone</p>
                <a href={`tel:${profile.altPhone.replace(/\s+/g, '')}`} className="contact-link">
                  {profile.altPhone}
                </a>
              </div>
            </li>
          )}

          {/* Location */}
          <li className="contact-item">
            <div className="icon-box">
              <MapPin />
            </div>
            <div className="contact-info">
              <p className="contact-title">Location</p>
              <address>{profile.location}</address>
            </div>
          </li>
        </ul>

        <div className="separator"></div>

        <ul className="social-list">
          {profile.github && (
            <li className="social-item">
              <a href={profile.github} className="social-link" target="_blank" rel="noopener noreferrer">
                <Github />
              </a>
            </li>
          )}
          {profile.linkedin && (
            <li className="social-item">
              <a href={profile.linkedin} className="social-link" target="_blank" rel="noopener noreferrer">
                <Linkedin />
              </a>
            </li>
          )}
          {profile.whatsapp && (
            <li className="social-item">
              <a href={`https://wa.me/${profile.whatsapp.replace(/\s+/g, '')}`} className="social-link" target="_blank" rel="noopener noreferrer">
                <Phone />
              </a>
            </li>
          )}
        </ul>
      </div>
    </aside>
  )
}

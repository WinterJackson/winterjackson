'use client'

import { DynamicIcon } from '@/lib/icons'
import { Client, Service } from '@prisma/client'
import Image from 'next/image'

interface ServicesProps {
  isActive: boolean
  services: Service[]
  clients: Client[]
}

export default function Services({ isActive, services, clients }: ServicesProps) {
  // Filter for only "service" category items
  const displayServices = services.filter(s => s.category === 'service' || !s.category)

  return (
    <article className={`services ${isActive ? 'active' : ''}`} data-page="services">
      <header>
        <h2 className="h2 article-title">Services</h2>
      </header>

      <section className="hidden show service">
        <ul className="service-list">
          {displayServices.map((service) => (
            <li key={service.id} className="service-item">
              <div className="service-icon-box">
                <div className="icon-bg">
                  {service.iconUrl.startsWith('http') || service.iconUrl.startsWith('/') ? (
                     <Image 
                      src={service.iconUrl} 
                      alt={`${service.title} icon`} 
                      width={40} 
                      height={40}
                      style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                    />
                  ) : (
                    <DynamicIcon name={service.iconUrl} size={40} color="#FFDB70" />
                  )}
                </div>
              </div>
              <div className="service-content-box">
                <h4 className="h4 service-item-title">{service.title}</h4>
                <p className="service-item-text">{service.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {clients.length > 0 && (
        <section className="hidden show clients">
          <h3 className="h3 clients-title">Clients</h3>
          <div className="slider">
            {[0, 1].map((wrapIndex) => (
              <div key={wrapIndex} className="client-items-wrap">
                {clients.map((client) => (
                  <div key={client.id} className="client-item" style={{ width: '250px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '15px' }}>
                    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                      <Image 
                        src={client.logoUrl} 
                        alt={client.name} 
                        fill
                        sizes="250px"
                        unoptimized
                        className="client-logo-img"
                        style={{ objectFit: 'contain' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
      )}
    </article>
  )
}

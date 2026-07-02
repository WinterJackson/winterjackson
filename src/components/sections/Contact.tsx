'use client'

import { submitContactMessage } from '@/app/actions/contact'
import { Profile } from '@prisma/client'
import { Send } from 'lucide-react'
import { ChangeEvent, useState } from 'react'
import toast from 'react-hot-toast'
import dynamic from 'next/dynamic'

const MapClient = dynamic(() => import('@/components/MapClient'), {
  ssr: false,
  loading: () => <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255, 255, 255, 0.05)' }}>Loading map...</div>
})

interface ContactProps {
  isActive: boolean
  profile: Profile
}

export default function Contact({ isActive, profile }: ContactProps) {
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    message: '',
    honeypot: '',
  })
  const [isValid, setIsValid] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    const newFormData = { ...formData, [name]: value }
    setFormData(newFormData)

    // Check if all fields are filled
    setIsValid(
      newFormData.fullname.trim() !== '' &&
      newFormData.email.trim() !== '' &&
      newFormData.message.trim() !== ''
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const res = await submitContactMessage(formData)

    if (res.success) {
      toast.success('Message sent successfully!')
      setFormData({ fullname: '', email: '', message: '', honeypot: '' })
      setIsValid(false)
    } else {
      toast.error(res.error || 'Failed to send message')
    }
    
    setIsSubmitting(false)
  }

  return (
    <article className={`contact ${isActive ? 'active' : ''}`} data-page="contact">
      <header>
        <h2 className="h2 article-title">Contact</h2>
      </header>

      <section className="mapbox" data-mapbox style={{ opacity: 1, visibility: 'visible', display: 'block', height: '350px' }}>
        <figure style={{ height: '100%' }}>
          <MapClient location={profile?.location || 'Nairobi, Kenya'} />
        </figure>
      </section>

      <section className="hidden show contact-form">
        <h3 className="h3 form-title">Contact Form</h3>

        <form
          onSubmit={handleSubmit}
          className="form"
          data-form
        >
          <div className="input-wrapper">
            <input
              type="text"
              name="fullname"
              className="form-input"
              placeholder="Full name"
              required
              value={formData.fullname}
              onChange={handleInputChange}
              data-form-input
            />

            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="Email address"
              required
              value={formData.email}
              onChange={handleInputChange}
              data-form-input
            />
            
            {/* Honeypot field - hidden from users but readable by bots */}
            <input
              type="text"
              name="honeypot"
              style={{ display: 'none' }}
              value={formData.honeypot}
              onChange={handleInputChange}
              tabIndex={-1}
              autoComplete="off"
            />


          </div>

          <textarea
            name="message"
            className="form-input"
            placeholder="Your Message"
            required
            value={formData.message}
            onChange={handleInputChange}
            data-form-input
          ></textarea>

          <button 
            className="form-btn" 
            type="submit" 
            disabled={!isValid || isSubmitting} 
            data-form-btn
            style={{ opacity: !isValid || isSubmitting ? 0.5 : 1 }}
          >
            <Send />
            <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
          </button>
        </form>
      </section>
    </article>
  )
}

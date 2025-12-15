'use client'

import { submitContactMessage } from '@/app/actions/contact'
import { Profile } from '@prisma/client'
import { Send } from 'lucide-react'
import { ChangeEvent, useState } from 'react'
import toast from 'react-hot-toast'

interface ContactProps {
  isActive: boolean
  profile: Profile
}

export default function Contact({ isActive, profile }: ContactProps) {
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    message: '',
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
      setFormData({ fullname: '', email: '', message: '' })
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

      <section className="mapbox" data-mapbox>
        <figure>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.2947436408396!2d36.81667!3d-1.28333!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f17611092a36f%3A0x5a1607e2d0e59f29!2sNairobi%2C%20Kenya!5e0!3m2!1sen!2sbd!4v1647608789441!5m2!1sen!2sbd"
            width="400"
            height="300"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </figure>
      </section>

      <section className="contact-form">
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

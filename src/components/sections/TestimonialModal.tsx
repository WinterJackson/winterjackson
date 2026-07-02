'use client'

import { Testimonial } from '@prisma/client'
import { X } from 'lucide-react'
import Image from 'next/image'

interface TestimonialModalProps {
  activeModal: Testimonial
  onClose: () => void
}

export default function TestimonialModal({ activeModal, onClose }: TestimonialModalProps) {
  return (
    <div className="modal-container active" data-modal-container>
      <div className="overlay active" onClick={onClose} data-overlay></div>
      <section className="hidden show testimonials-modal">
        <button
          className="modal-close-btn"
          onClick={onClose}
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
  )
}

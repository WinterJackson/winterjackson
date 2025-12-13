'use client'

import { deleteMessage, markMessageRead } from '@/app/actions/dashboard'
import { Check, Mail, MessageSquare, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

interface Message {
  id: string
  name: string
  email: string
  message: string
  isRead: boolean
  createdAt: Date
}

interface InboxWidgetProps {
  initialMessages: Message[]
  styles: any
}

export default function InboxWidget({ initialMessages, styles }: InboxWidgetProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)

  const handleRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    await markMessageRead(id)
    setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: true } : m))
    toast.success('Marked as read')
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if(!confirm('Delete this message?')) return
    await deleteMessage(id)
    setMessages(prev => prev.filter(m => m.id !== id))
    toast.success('Message deleted')
    if (selectedMessage?.id === id) setSelectedMessage(null)
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
         <div className={styles.cardTitle}>
            <MessageSquare size={20} style={{ color: '#ec4899' }} />
            Inbox
            {messages.filter(m => !m.isRead).length > 0 && (
                <span style={{ fontSize: '12px', background: 'rgba(236, 72, 153, 0.2)', color: '#ec4899', padding: '2px 8px', borderRadius: '10px', marginLeft: '10px' }}>
                    {messages.filter(m => !m.isRead).length} New
                </span>
            )}
         </div>
      </div>

      <div className={styles.inboxList}>
        {messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                <Mail size={40} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
                <p>Inbox empty</p>
            </div>
        ) : (
            messages.map((msg) => (
            <div 
                key={msg.id}
                onClick={() => setSelectedMessage(msg)}
                className={`${styles.inboxItem} ${!msg.isRead ? styles.unread : ''}`}
            >
                <div className={styles.inboxHeader}>
                    <span className={styles.inboxName}>{msg.name}</span>
                    <span className={styles.inboxDate}>{new Date(msg.createdAt).toLocaleDateString()}</span>
                </div>
                <p className={styles.inboxPreview}>{msg.message}</p>
                
                {/* Actions inline for desktop */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px', justifyContent: 'flex-end', opacity: 0.7 }}>
                     {!msg.isRead && (
                         <button onClick={(e) => handleRead(msg.id, e)} title="Read"><Check size={16}  color="#10b981"/></button>
                     )}
                     <button onClick={(e) => handleDelete(msg.id, e)} title="Delete"><Trash2 size={16} color="#ef4444" /></button>
                </div>
            </div>
            ))
        )}
      </div>

      {/* Modal - kept simple with inline styles for overlay to ensure z-index work */}
      {selectedMessage && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setSelectedMessage(null)}>
          <div className={styles.card} style={{ width: '100%', maxWidth: '500px', height: 'auto', maxHeight: '90vh', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button 
                onClick={() => setSelectedMessage(null)}
                style={{ position: 'absolute', top: '20px', right: '20px', color: 'var(--light-gray)' }}
            >
                <X size={20} />
            </button>
            
            <h3 style={{ fontSize: '24px', color: 'var(--white-1)', marginBottom: '5px' }}>{selectedMessage.name}</h3>
            <p style={{ color: 'var(--light-gray)', marginBottom: '20px' }}>{selectedMessage.email}</p>
            
            <div style={{ background: 'var(--onyx)', padding: '20px', borderRadius: '10px', color: 'var(--white-2)', lineHeight: '1.6', marginBottom: '20px', overflowY: 'auto', maxHeight: '300px' }}>
                {selectedMessage.message}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <a href={`mailto:${selectedMessage.email}`} style={{ background: 'var(--white-1)', color: 'black', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold' }}>
                    Reply
                </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

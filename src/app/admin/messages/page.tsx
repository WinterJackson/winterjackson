'use client'

import { deleteMessage, getMessages, markMessageRead } from '@/app/actions/dashboard'
import { ArrowLeft, MailOpen, Reply, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import styles from './Messages.module.css'

interface Message {
  id: string
  name: string
  email: string
  message: string
  isRead: boolean
  createdAt: Date | string
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMessages()
  }, [])

  const loadMessages = async () => {
    setLoading(true)
    try {
      const data = await getMessages()
      // @ts-ignore - prisma dates might need conversion if passed from server action directly 
      // but assuming Server Actions serialize dates fine or we get simple objects
      setMessages(data)
    } catch (error) {
      toast.error('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = async (msg: Message) => {
    setSelectedId(msg.id)
    if (!msg.isRead) {
      await markMessageRead(msg.id)
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isRead: true } : m))
      // No toast for auto-read on open, cleaner UX
    }
  }

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (!confirm('Are you sure you want to delete this message?')) return

    const res = await deleteMessage(id)
    if (res.success) {
      setMessages(prev => prev.filter(m => m.id !== id))
      if (selectedId === id) setSelectedId(null)
      toast.success('Message deleted')
    } else {
      toast.error('Failed to delete')
    }
  }

  const filteredMessages = messages.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.email.toLowerCase().includes(search.toLowerCase()) ||
    m.message.toLowerCase().includes(search.toLowerCase())
  )

  const selectedMessage = messages.find(m => m.id === selectedId)


  return (
    <div>
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
         <div>
            <h1 style={{ fontSize: 'var(--fs-1)', color: 'var(--white-1)', marginBottom: '8px' }}>Messages</h1>
            <p style={{ color: 'var(--light-gray)', fontSize: 'var(--fs-6)' }}>Manage your client inquiries</p>
         </div>
         {/* Could add a 'Mark all read' button here later */}
      </div>

      <div className={styles.container}>
        {/* Sidebar / List */}
        <div className={styles.messageListColumn}>
          <div className={styles.searchBar}>
            <input 
              type="text" 
              placeholder="Search messages..." 
              className={styles.searchInput}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className={styles.messageList}>
            {loading ? (
               // Skeleton Loader
               Array.from({ length: 5 }).map((_, i) => (
                 <div key={i} className={styles.messageItem} style={{ pointerEvents: 'none' }}>
                    <div className={styles.itemHeader} style={{ marginBottom: '8px' }}>
                       <div className={styles.skeleton} style={{ width: '60%', height: '16px' }} />
                       <div className={styles.skeleton} style={{ width: '20%', height: '12px' }} />
                    </div>
                    <div className={styles.skeleton} style={{ width: '90%', height: '14px', marginBottom: '4px' }} />
                    <div className={styles.skeleton} style={{ width: '70%', height: '14px' }} />
                 </div>
               ))
            ) : filteredMessages.length === 0 ? (
               <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--light-gray-70)' }}>
                 <p>No messages found.</p>
               </div>
            ) : (
               filteredMessages.map(msg => (
                 <div 
                   key={msg.id} 
                   className={`${styles.messageItem} ${selectedId === msg.id ? styles.active : ''} ${!msg.isRead ? styles.unread : ''}`}
                   onClick={() => handleSelect(msg)}
                 >
                    <div className={styles.itemHeader}>
                       <span className={styles.senderName}>{msg.name}</span>
                       <span className={styles.messageDate} style={{ minWidth: 'fit-content' }}>
                         {new Date(msg.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                       </span>
                    </div>
                    <p className={styles.excerpt}>{msg.message}</p>
                 </div>
               ))
            )}
          </div>
        </div>

        {/* Detail View */}
        <div className={`${styles.messageDetail} ${!selectedMessage ? 'hidden sm:flex' : ''}`}>
           {!selectedMessage ? (
              <div className={styles.emptySelection}>
                 <div style={{ padding: '20px', background: 'var(--onyx)', borderRadius: '50%' }}>
                    <MailOpen size={40} style={{ color: 'var(--bittersweet-shimmer)' }} />
                 </div>
                 <p style={{ fontSize: 'var(--fs-6)' }}>Select a message to read details</p>
              </div>
           ) : (
              <>
                <div className={styles.detailHeader}>
                   <div className={styles.userInfo}>
                      <button 
                         onClick={() => setSelectedId(null)}
                         className={styles.backButton} /* We need to add this class */
                         style={{ display: 'none' }} /* Hidden by default, shown in media query via CSS */
                      >
                         <ArrowLeft color="white" size={20} />
                      </button>

                      <div className={styles.avatar}>
                         {selectedMessage.name.charAt(0).toUpperCase()}
                      </div>
                      <div className={styles.meta}>
                         <h2>{selectedMessage.name}</h2>
                         <p>{selectedMessage.email}</p>
                      </div>
                   </div>
                   
                   <div className={styles.actions}>
                      <span style={{ fontSize: '12px', color: 'var(--light-gray-70)', marginRight: '10px', alignSelf: 'center' }}>
                         {new Date(selectedMessage.createdAt).toLocaleString()}
                      </span>
                      <button 
                        className={`${styles.actionBtn} ${styles.delete}`} 
                        onClick={(e) => handleDelete(selectedMessage.id, e)}
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                   </div>
                </div>

                <div className={styles.detailContent}>
                   {selectedMessage.message}
                </div>

                <div className={styles.detailFooter}>
                   <a 
                     href={`mailto:${selectedMessage.email}`} 
                     className={styles.replyBtn}
                   >
                      <Reply size={18} />
                      Reply via Email
                   </a>
                </div>
              </>
           )}
        </div>
      </div>
    </div>
  )
}

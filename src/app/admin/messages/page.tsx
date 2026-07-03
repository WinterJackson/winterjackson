'use client'

import { deleteMessage, getMessages, markMessageRead, markAllMessagesRead, markMessageUnread, deleteMessages, markMessagesRead } from '@/app/actions/dashboard'
import { ArrowLeft, Mail, MailOpen, Reply, Trash2, RefreshCcw, CheckSquare } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import styles from './Messages.module.css'
import adminStyles from '@/components/admin/Shared.module.css'

interface Message {
  id: string
  name: string
  email: string
  message: string
  isRead: boolean
  createdAt: Date | string
}

const PAGE_SIZE = 50

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [skip, setSkip] = useState(0)

  const loadMessages = async (isRefresh = false) => {
    if (isRefresh) {
        setLoading(true)
        setSkip(0)
    }
    
    try {
      const data = await getMessages(0, PAGE_SIZE)
      setMessages(JSON.parse(JSON.stringify(data)))
      setHasMore(data.length === PAGE_SIZE)
      
      // Auto-select first message on desktop if none selected and it's initial load
      if (isRefresh && data.length > 0 && window.innerWidth > 900) {
        setSelectedId(data[0].id)
        if (!data[0].isRead) {
          markMessageRead(data[0].id)
          setMessages(prev => prev.map((m, i) => i === 0 ? { ...m, isRead: true } : m))
        }
      }
    } catch (error) {
      toast.error('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  const loadMore = async () => {
    setLoadingMore(true)
    try {
        const nextSkip = skip + PAGE_SIZE
        const data = await getMessages(nextSkip, PAGE_SIZE)
        
        if (data.length > 0) {
            setMessages(prev => [...prev, ...JSON.parse(JSON.stringify(data))])
            setSkip(nextSkip)
            setHasMore(data.length === PAGE_SIZE)
        } else {
            setHasMore(false)
        }
    } catch (error) {
        toast.error('Failed to load older messages')
    } finally {
        setLoadingMore(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadMessages(true)
  }, [])

  const handleSelect = async (msg: Message) => {
    setSelectedId(msg.id)
    if (!msg.isRead) {
      await markMessageRead(msg.id)
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isRead: true } : m))
    }
  }

  const toggleMessageSelection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedMessageIds(prev => 
        prev.includes(id) ? prev.filter(mId => mId !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedMessageIds.length === filteredMessages.length) {
        setSelectedMessageIds([])
    } else {
        setSelectedMessageIds(filteredMessages.map(m => m.id))
    }
  }

  const handleMarkUnread = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    const res = await markMessageUnread(id)
    if (res.success) {
      setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: false } : m))
      toast.success('Marked as unread')
    } else {
      toast.error('Failed to mark as unread')
    }
  }

  const handleBulkMarkRead = async () => {
    if (selectedMessageIds.length === 0) return
    setLoading(true)
    const res = await markMessagesRead(selectedMessageIds)
    if (res.success) {
        setMessages(prev => prev.map(m => selectedMessageIds.includes(m.id) ? { ...m, isRead: true } : m))
        setSelectedMessageIds([])
        toast.success(`Marked ${selectedMessageIds.length} messages as read`)
    } else {
        toast.error('Failed to mark messages as read')
    }
    setLoading(false)
  }

  const handleMarkAllRead = async () => {
    const unreadCount = messages.filter(m => !m.isRead).length
    if (unreadCount === 0) return

    setLoading(true)
    const res = await markAllMessagesRead()
    if (res.success) {
      setMessages(prev => prev.map(m => ({ ...m, isRead: true })))
      toast.success('All messages marked as read')
    } else {
      toast.error('Failed to mark messages as read')
    }
    setLoading(false)
  }

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (!confirm('Are you sure you want to delete this message?')) return

    const res = await deleteMessage(id)
    if (res.success) {
      setMessages(prev => prev.filter(m => m.id !== id))
      if (selectedId === id) setSelectedId(null)
      setSelectedMessageIds(prev => prev.filter(mId => mId !== id))
      toast.success('Message deleted')
    } else {
      toast.error('Failed to delete')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedMessageIds.length === 0) return
    if (!confirm(`Are you sure you want to delete ${selectedMessageIds.length} messages?`)) return

    setLoading(true)
    const res = await deleteMessages(selectedMessageIds)
    if (res.success) {
        setMessages(prev => prev.filter(m => !selectedMessageIds.includes(m.id)))
        if (selectedId && selectedMessageIds.includes(selectedId)) setSelectedId(null)
        setSelectedMessageIds([])
        toast.success('Messages deleted')
    } else {
        toast.error('Failed to delete messages')
    }
    setLoading(false)
  }

  const filteredMessages = messages.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.email.toLowerCase().includes(search.toLowerCase()) ||
    m.message.toLowerCase().includes(search.toLowerCase())
  )

  const selectedMessage = messages.find(m => m.id === selectedId)


  return (
    <div className={adminStyles.page}>
      <header className={adminStyles.pageHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Messages</h1>
          <p>Manage your client inquiries</p>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          {selectedMessageIds.length > 0 ? (
             <>
               <button onClick={toggleSelectAll} className={styles.markReadBtn} style={{ background: 'var(--onyx)', color: 'var(--light-gray)' }} title="Deselect All">
                 <CheckSquare size={18} />
                 Deselect All
               </button>
               <button onClick={handleBulkMarkRead} className={styles.markReadBtn} style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}>
                 <MailOpen size={18} />
                 Read ({selectedMessageIds.length})
               </button>
               <button onClick={handleBulkDelete} className={styles.markReadBtn} style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
                 <Trash2 size={18} />
                 Delete ({selectedMessageIds.length})
               </button>
             </>
          ) : (
             <>
               <button onClick={toggleSelectAll} className={styles.markReadBtn} style={{ background: 'var(--onyx)', color: 'var(--light-gray)' }} title="Select All Messages">
                 <CheckSquare size={18} />
                 Select All
               </button>
               <button onClick={() => loadMessages(true)} className={styles.markReadBtn} style={{ background: 'var(--onyx)', color: 'var(--light-gray)' }} title="Refresh Inbox">
                 <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
               </button>
               <button 
                 onClick={handleMarkAllRead}
                 disabled={loading || messages.filter(m => !m.isRead).length === 0}
                 className={styles.markReadBtn}
               >
                 <CheckSquare size={18} />
                 Mark all read
               </button>
             </>
          )}
        </div>
      </header>

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
            {loading && messages.length === 0 ? (
               <div className="flex py-20 w-full items-center justify-center">
                 <div className="flex flex-col items-center">
                   <div className="w-10 h-10 border-4 border-zinc-800 border-t-[var(--bittersweet-shimmer)] rounded-full animate-spin"></div>
                   <p className="mt-4 text-gray-400 text-sm">Loading messages...</p>
                 </div>
               </div>
            ) : filteredMessages.length === 0 ? (
               <div className={styles.emptySelection}>
                 <div style={{ padding: '20px', background: 'var(--onyx)', borderRadius: '50%' }}>
                    <MailOpen size={40} style={{ color: 'var(--bittersweet-shimmer)' }} />
                 </div>
                 <p>No messages found.</p>
               </div>
            ) : (
               <>
                 {filteredMessages.map(msg => (
                   <div 
                     key={msg.id} 
                     className={`${styles.messageItem} ${selectedId === msg.id ? styles.active : ''} ${!msg.isRead ? styles.unread : ''}`}
                     onClick={() => handleSelect(msg)}
                   >
                      <div className="mr-3 flex items-center justify-center" onClick={(e) => toggleMessageSelection(msg.id, e)}>
                          <input 
                              type="checkbox" 
                              checked={selectedMessageIds.includes(msg.id)} 
                              readOnly 
                              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                          />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                          <div className={styles.itemHeader}>
                             <span className={styles.senderName}>{msg.name}</span>
                             <span className={styles.messageDate} style={{ minWidth: 'fit-content' }}>
                               {new Date(msg.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                             </span>
                          </div>
                          <p className={styles.excerpt}>{msg.message}</p>
                      </div>
                   </div>
                 ))}
                 
                 {hasMore && !search && (
                     <div style={{ padding: '15px', display: 'flex', justifyContent: 'center' }}>
                         <button 
                             onClick={loadMore} 
                             disabled={loadingMore}
                             style={{ background: 'var(--onyx)', color: 'var(--white-2)', padding: '8px 16px', borderRadius: '8px', fontSize: '14px' }}
                         >
                             {loadingMore ? 'Loading...' : 'Load Older Messages'}
                         </button>
                     </div>
                 )}
               </>
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
                         className={styles.backButton}
                         style={{ display: 'none' }}
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
                        className={styles.actionBtn} 
                        onClick={(e) => handleMarkUnread(selectedMessage.id, e)}
                        title="Mark as unread"
                      >
                        <Mail size={18} />
                      </button>
                      <button 
                        className={`${styles.actionBtn} ${styles.delete}`} 
                        onClick={(e) => handleDelete(selectedMessage.id, e)}
                        title="Delete message"
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
                     href={`https://mail.google.com/mail/?view=cm&fs=1&to=${selectedMessage.email}&su=Following up on your Inquiry`}
                     target="_blank"
                     rel="noopener noreferrer"
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

'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Client } from '@prisma/client'
import { Briefcase, Edit, Save, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import AdminModal from '@/components/admin/AdminModal'
import AdminTable, { Column } from '@/components/admin/AdminTable'
import ImageUpload from '@/components/admin/ImageUpload'
import { ClientFormData, ClientSchema } from '@/lib/schemas'

import formStyles from '@/components/admin/AdminForm.module.css'
import tableStyles from '@/components/admin/AdminTable.module.css'
import adminStyles from '@/components/admin/Shared.module.css'

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Client | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<ClientFormData>({
    resolver: zodResolver(ClientSchema),
    defaultValues: {
      name: '',
      logoUrl: '',
      order: 0,
      isActive: true
    }
  })

  useEffect(() => {
    fetchClients()
  }, [])

  useEffect(() => {
    if (editingItem) {
      reset({
        name: editingItem.name,
        logoUrl: editingItem.logoUrl,
        order: editingItem.order,
        isActive: editingItem.isActive
      })
    } else {
      reset({
        name: '',
        logoUrl: '',
        order: 0,
        isActive: true
      })
    }
  }, [editingItem, reset])

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients')
      if (res.ok) {
        const data = await res.json()
        setClients(data)
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error)
      toast.error('Failed to load clients')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: ClientFormData) => {
    try {
      const url = editingItem ? `/api/clients/${editingItem.id}` : '/api/clients'
      const method = editingItem ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error('Failed to save client')

      toast.success(editingItem ? 'Client updated' : 'Client created')
      fetchClients()
      setIsModalOpen(false)
    } catch (error) {
      console.error('Failed to save client:', error)
      toast.error('Failed to save client')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return

    try {
      const res = await fetch(`/api/clients/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setClients(clients.filter(c => c.id !== id))
        toast.success('Client deleted')
      } else {
        throw new Error('Failed to delete')
      }
    } catch (error) {
      console.error('Failed to delete client:', error)
      toast.error('Failed to delete client')
    }
  }

  const handleEdit = (item: Client) => {
    setEditingItem(item)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setEditingItem(null)
    setIsModalOpen(true)
  }

  const columns: Column<Client>[] = [
    { header: 'Name', accessorKey: 'name' },
    {
      header: 'Logo',
      cell: (item) => (
        <div style={{ width: '150px', height: '150px', borderRadius: '10px', overflow: 'hidden', background: 'rgba(255,255,255,0.1)', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             {/* eslint-disable-next-line @next/next/no-img-element */}
             <img 
                src={item.logoUrl} 
                alt={item.name} 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
             />
        </div>
      )
    },
    { 
      header: 'Status', 
      cell: (item) => (
        <span className={`${tableStyles.statusBadge} ${!item.isActive ? tableStyles.statusBadgeInactive : ''}`}>
          {item.isActive ? 'Active' : 'Hidden'}
        </span>
      )
    },
    {
      header: 'Actions',
      cell: (item) => (
        <div className={tableStyles.actionButtons}>
          <button onClick={() => handleEdit(item)} className={tableStyles.editBtn}>
            <Edit size={18} />
          </button>
          <button onClick={() => handleDelete(item.id)} className={tableStyles.deleteBtn}>
            <Trash2 size={18} />
          </button>
        </div>
      )
    }
  ]

  return (
    <div className={adminStyles.page}>
      <header className={adminStyles.pageHeader}>
        <h1>Clients</h1>
        <p>Manage client logos</p>
      </header>

      <AdminTable 
        data={clients}
        columns={columns}
        isLoading={loading}
        onAdd={handleAdd}
        addButtonLabel="Add Client"
        emptyMessage="No clients yet"
        emptyIcon={Briefcase}
      />

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Client' : 'Add Client'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className={formStyles.form}>
          <div className={formStyles.row}>
            <div className={formStyles.group}>
              <label>Client Name</label>
              <input type="text" {...register('name')} className={formStyles.input} />
              {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
            </div>
            <div className={formStyles.group}>
              <label>Order</label>
              <input type="number" {...register('order', { valueAsNumber: true })} className={formStyles.input} />
            </div>
          </div>

          <div className={formStyles.group}>
             <ImageUpload 
                value={watch('logoUrl')} 
                onChange={(url) => setValue('logoUrl', url)} 
                label="Client Logo"
             />
             {errors.logoUrl && <span className="text-red-500 text-xs">{errors.logoUrl.message}</span>}
          </div>

          <div className={formStyles.group}>
            <label className={formStyles.checkboxGroup}>
              <input type="checkbox" {...register('isActive')} className={formStyles.checkbox} />
              <span className={formStyles.checkboxLabel}>Active (visible on portfolio)</span>
            </label>
          </div>

          <div className={formStyles.actions}>
            <button type="button" onClick={() => setIsModalOpen(false)} className={formStyles.cancelBtn}>
              Cancel
            </button>
            <button type="submit" className={formStyles.saveBtn} disabled={isSubmitting}>
              {isSubmitting ? (
                 <>
                   <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-[10px] animate-spin"></span>
                   Saving...
                 </>
              ) : (
                <>
                  <Save />
                  Save Client
                </>
              )}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  )
}

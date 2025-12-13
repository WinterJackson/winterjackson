'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Service } from '@prisma/client'
import { Edit, Hammer, Save, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import AdminModal from '@/components/admin/AdminModal'
import AdminTable, { Column } from '@/components/admin/AdminTable'
import { ServiceFormData, ServiceSchema } from '@/lib/schemas'

import formStyles from '@/components/admin/AdminForm.module.css'
import tableStyles from '@/components/admin/AdminTable.module.css'
import adminStyles from '@/components/admin/Shared.module.css'

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Service | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ServiceFormData>({
    resolver: zodResolver(ServiceSchema),
    defaultValues: {
      title: '',
      description: '',
      iconUrl: '',
      category: 'service',
      order: 0
    }
  })

  useEffect(() => {
    fetchServices()
  }, [])

  useEffect(() => {
    if (editingItem) {
      reset({
        title: editingItem.title,
        description: editingItem.description,
        iconUrl: editingItem.iconUrl,
        category: editingItem.category || 'service',
        order: editingItem.order
      })
    } else {
      reset({
        title: '',
        description: '',
        iconUrl: '',
        category: 'service',
        order: 0
      })
    }
  }, [editingItem, reset])

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/services')
      if (res.ok) {
        const data = await res.json()
        setServices(data)
      }
    } catch (error) {
      console.error('Failed to fetch services:', error)
      toast.error('Failed to load services')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: ServiceFormData) => {
    try {
      const url = editingItem ? `/api/services/${editingItem.id}` : '/api/services'
      const method = editingItem ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error('Failed to save service')

      toast.success(editingItem ? 'Service updated' : 'Service created')
      fetchServices()
      setIsModalOpen(false)
    } catch (error) {
      console.error('Failed to save service:', error)
      toast.error('Failed to save service')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return

    try {
      const res = await fetch(`/api/services/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setServices(services.filter(s => s.id !== id))
        toast.success('Service deleted')
      } else {
        throw new Error('Failed to delete')
      }
    } catch (error) {
      console.error('Failed to delete service:', error)
      toast.error('Failed to delete service')
    }
  }

  const handleEdit = (item: Service) => {
    setEditingItem(item)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setEditingItem(null)
    setIsModalOpen(true)
  }

  const columns: Column<Service>[] = [
    { header: 'Title', accessorKey: 'title' },
    { 
      header: 'Description', 
      cell: (item) => <span>{item.description.substring(0, 60)}...</span> 
    },
    {
      header: 'Type',
      cell: (item) => (
         <span className={item.category === 'venture' ? tableStyles.categoryBadge : tableStyles.statusBadge}>
            {item.category === 'venture' ? 'Venture' : 'Service'}
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
        <h1>Services</h1>
        <p>Manage services you offer</p>
      </header>

      <AdminTable 
        data={services}
        columns={columns}
        isLoading={loading}
        onAdd={handleAdd}
        addButtonLabel="Add Service"
        emptyMessage="No services yet"
        emptyIcon={Hammer}
      />

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Service' : 'Add Service'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className={formStyles.form}>
          <div className={formStyles.row}>
            <div className={formStyles.group}>
              <label>Service Title</label>
              <input type="text" {...register('title')} className={formStyles.input} />
              {errors.title && <span className="text-red-500 text-xs">{errors.title.message}</span>}
            </div>
            <div className={formStyles.group}>
              <label>Order</label>
              <input type="number" {...register('order', { valueAsNumber: true })} className={formStyles.input} />
            </div>
          </div>

          <div className={formStyles.group}>
            <label>Category</label>
            <select {...register('category')} className={formStyles.select}>
              <option value="service" style={{ color: "black"}}>Service (What I Do)</option>
              <option value="venture" style={{ color: "black"}}>Personal Venture</option>
            </select>
          </div>


          <div className={formStyles.group}>
            <label>Description</label>
            <textarea rows={4} {...register('description')} className={formStyles.textarea} />
            {errors.description && <span className="text-red-500 text-xs">{errors.description.message}</span>}
          </div>

          <div className={formStyles.group}>
            <label>Icon URL (IonIcons Name or URL)</label>
            <input type="text" {...register('iconUrl')} placeholder="e.g. code-slash-outline" className={formStyles.input} />
            {errors.iconUrl && <span className="text-red-500 text-xs">{errors.iconUrl.message}</span>}
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
                  Save Service
                </>
              )}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  )
}


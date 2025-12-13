'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Testimonial } from '@prisma/client'
import { Edit, MessageSquare, Save, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import AdminModal from '@/components/admin/AdminModal'
import AdminTable, { Column } from '@/components/admin/AdminTable'
import ImageUpload from '@/components/admin/ImageUpload'
import { TestimonialFormData, TestimonialSchema } from '@/lib/schemas'

import formStyles from '@/components/admin/AdminForm.module.css'
import tableStyles from '@/components/admin/AdminTable.module.css'
import adminStyles from '@/components/admin/Shared.module.css'

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<TestimonialFormData>({
    resolver: zodResolver(TestimonialSchema),
    defaultValues: {
      name: '',
      role: '',
      company: '',
      text: '',
      linkedinUrl: '',
      avatarUrl: '',
      isActive: true,
      order: 0
    }
  })

  useEffect(() => {
    fetchTestimonials()
  }, [])

  useEffect(() => {
    if (editingItem) {
      reset({
        name: editingItem.name,
        role: editingItem.role,
        company: editingItem.company || '',
        text: editingItem.text,
        linkedinUrl: editingItem.linkedinUrl || '',
        avatarUrl: editingItem.avatarUrl || '',
        isActive: editingItem.isActive,
        order: editingItem.order
      })
    } else {
      reset({
        name: '',
        role: '',
        company: '',
        text: '',
        linkedinUrl: '',
        avatarUrl: '',
        isActive: true,
        order: 0
      })
    }
  }, [editingItem, reset])

  const fetchTestimonials = async () => {
    try {
      const res = await fetch('/api/testimonials')
      if (res.ok) {
        const data = await res.json()
        setTestimonials(data)
      }
    } catch (error) {
      console.error('Failed to fetch testimonials:', error)
      toast.error('Failed to load testimonials')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: TestimonialFormData) => {
    try {
      const url = editingItem ? `/api/testimonials/${editingItem.id}` : '/api/testimonials'
      const method = editingItem ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error('Failed to save testimonial')

      toast.success(editingItem ? 'Testimonial updated' : 'Testimonial created')
      fetchTestimonials()
      setIsModalOpen(false)
    } catch (error) {
      console.error('Failed to save testimonial:', error)
      toast.error('Failed to save testimonial')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return

    try {
      const res = await fetch(`/api/testimonials/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setTestimonials(testimonials.filter(t => t.id !== id))
        toast.success('Testimonial deleted')
      } else {
        throw new Error('Failed to delete')
      }
    } catch (error) {
      console.error('Failed to delete testimonial:', error)
      toast.error('Failed to delete testimonial')
    }
  }

  const handleEdit = (item: Testimonial) => {
    setEditingItem(item)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setEditingItem(null)
    setIsModalOpen(true)
  }

  const columns: Column<Testimonial>[] = [
    { header: 'Name', accessorKey: 'name' },
    { header: 'Role', accessorKey: 'role' },
    { 
      header: 'Company', 
      accessorKey: 'company',
      cell: (item) => item.company || '—'
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
        <h1>Testimonials</h1>
        <p>Manage client testimonials</p>
      </header>

      <AdminTable 
        data={testimonials}
        columns={columns}
        isLoading={loading}
        onAdd={handleAdd}
        addButtonLabel="Add Testimonial"
        emptyMessage="No testimonials yet"
        emptyIcon={MessageSquare}
      />

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Testimonial' : 'Add Testimonial'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className={formStyles.group}>
          <div className={formStyles.row}>
            <div className={formStyles.group}>
              <label>Name</label>
              <input 
                type="text" 
                {...register('name')} 
                className={formStyles.input}
              />
              {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
            </div>
            <div className={formStyles.group}>
              <label>Role</label>
              <input 
                type="text" 
                {...register('role')} 
                className={formStyles.input}
              />
              {errors.role && <span className="text-red-500 text-xs">{errors.role.message}</span>}
            </div>
          </div>

          <div className={formStyles.row}>
            <div className={formStyles.group}>
              <label>Company</label>
              <input 
                type="text" 
                {...register('company')} 
                className={formStyles.input}
              />
            </div>
            <div className={formStyles.group}>
              <label>Order</label>
              <input 
                type="number" 
                {...register('order', { valueAsNumber: true })} 
                className={formStyles.input}
              />
            </div>
          </div>

          <div className={formStyles.group}>
            <ImageUpload 
              value={watch('avatarUrl') || ''} 
              onChange={(url) => setValue('avatarUrl', url)} 
              label="Avatar Image"
            />
          </div>

          <div className={formStyles.group}>
            <label>LinkedIn URL</label>
            <input 
              type="text" 
              {...register('linkedinUrl')} 
              className={formStyles.input}
              placeholder="https://linkedin.com/in/..."
            />
          </div>

          <div className={formStyles.group}>
            <label>Testimonial Text</label>
            <textarea 
              rows={4} 
              {...register('text')} 
              className={formStyles.textarea}
            />
            {errors.text && <span className="text-red-500 text-xs">{errors.text.message}</span>}
          </div>

          <div className={formStyles.group}>
            <label className={formStyles.checkboxGroup}>
              <input 
                type="checkbox" 
                {...register('isActive')} 
                className={formStyles.checkbox}
              />
              <span className={formStyles.checkboxLabel}>Active (Visible on site)</span>
            </label>
          </div>

          <div className={formStyles.actions}>
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)} 
              className={formStyles.cancelBtn}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={formStyles.saveBtn}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                 <>
                   <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-[10px] animate-spin"></span>
                   Saving...
                 </>
              ) : (
                <>
                  <Save />
                  Save Testimonial
                </>
              )}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  )
}

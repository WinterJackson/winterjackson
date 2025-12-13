'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Experience } from '@prisma/client'
import { Briefcase, Edit, Save, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import AdminModal from '@/components/admin/AdminModal'
import AdminTable, { Column } from '@/components/admin/AdminTable'
import { ExperienceFormData, ExperienceSchema } from '@/lib/schemas'

import formStyles from '@/components/admin/AdminForm.module.css'
import tableStyles from '@/components/admin/AdminTable.module.css'
import adminStyles from '@/components/admin/Shared.module.css'

export default function AdminExperiencePage() {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Experience | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ExperienceFormData>({
    resolver: zodResolver(ExperienceSchema),
    defaultValues: {
      jobTitle: '',
      company: '',
      startDate: '',
      endDate: '',
      description: '',
      order: 0
    }
  })

  useEffect(() => {
    fetchExperiences()
  }, [])

  useEffect(() => {
    if (editingItem) {
      reset({
        jobTitle: editingItem.jobTitle,
        company: editingItem.company,
        startDate: editingItem.startDate,
        endDate: editingItem.endDate || '',
        description: editingItem.description,
        order: editingItem.order
      })
    } else {
      reset({
        jobTitle: '',
        company: '',
        startDate: '',
        endDate: '',
        description: '',
        order: 0
      })
    }
  }, [editingItem, reset])

  const fetchExperiences = async () => {
    try {
      const res = await fetch('/api/experience')
      if (res.ok) {
        const data = await res.json()
        setExperiences(data)
      }
    } catch (error) {
      console.error('Failed to fetch experiences:', error)
      toast.error('Failed to load experiences')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: ExperienceFormData) => {
    try {
      const url = editingItem ? `/api/experience/${editingItem.id}` : '/api/experience'
      const method = editingItem ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error('Failed to save experience')

      toast.success(editingItem ? 'Experience updated' : 'Experience created')
      fetchExperiences()
      setIsModalOpen(false)
    } catch (error) {
      console.error('Failed to save experience:', error)
      toast.error('Failed to save experience')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this experience?')) return

    try {
      const res = await fetch(`/api/experience/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setExperiences(experiences.filter(e => e.id !== id))
        toast.success('Experience deleted')
      } else {
        throw new Error('Failed to delete')
      }
    } catch (error) {
      console.error('Failed to delete experience:', error)
      toast.error('Failed to delete experience')
    }
  }

  const handleEdit = (item: Experience) => {
    setEditingItem(item)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setEditingItem(null)
    setIsModalOpen(true)
  }

  const columns: Column<Experience>[] = [
    { header: 'Job Title', accessorKey: 'jobTitle' },
    { header: 'Company', accessorKey: 'company' },
    { 
      header: 'Period', 
      cell: (item) => <span>{item.startDate} — {item.endDate || 'Present'}</span> 
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
        <h1>Experience</h1>
        <p>Manage your work experience</p>
      </header>

      <AdminTable 
        data={experiences}
        columns={columns}
        isLoading={loading}
        onAdd={handleAdd}
        addButtonLabel="Add Experience"
        emptyMessage="No experience known"
        emptyIcon={Briefcase}
      />

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Experience' : 'Add Experience'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className={formStyles.form}>
          <div className={formStyles.group}>
            <label>Job Title</label>
            <input type="text" {...register('jobTitle')} className={formStyles.input} />
            {errors.jobTitle && <span className="text-red-500 text-xs">{errors.jobTitle.message}</span>}
          </div>

          <div className={formStyles.row}>
            <div className={formStyles.group}>
              <label>Company</label>
              <input type="text" {...register('company')} className={formStyles.input} />
              {errors.company && <span className="text-red-500 text-xs">{errors.company.message}</span>}
            </div>
            <div className={formStyles.group}>
              <label>Order</label>
              <input type="number" {...register('order', { valueAsNumber: true })} className={formStyles.input} />
            </div>
          </div>

          <div className={formStyles.row}>
            <div className={formStyles.group}>
              <label>Start Date</label>
              <input type="text" {...register('startDate')} placeholder="e.g. Jan 2023" className={formStyles.input} />
              {errors.startDate && <span className="text-red-500 text-xs">{errors.startDate.message}</span>}
            </div>
            <div className={formStyles.group}>
              <label>End Date</label>
              <input type="text" {...register('endDate')} placeholder="Leave empty for current" className={formStyles.input} />
            </div>
          </div>

          <div className={formStyles.group}>
            <label>Description</label>
            <textarea rows={5} {...register('description')} className={formStyles.textarea} />
            {errors.description && <span className="text-red-500 text-xs">{errors.description.message}</span>}
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
                  Save Experience
                </>
              )}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  )
}


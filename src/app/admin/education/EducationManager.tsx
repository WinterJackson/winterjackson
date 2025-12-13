'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Education } from '@prisma/client'
import { Edit, GraduationCap, Save, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import AdminModal from '@/components/admin/AdminModal'
import AdminTable, { Column } from '@/components/admin/AdminTable'
import { EducationFormData, EducationSchema } from '@/lib/schemas'

import formStyles from '@/components/admin/AdminForm.module.css'
import tableStyles from '@/components/admin/AdminTable.module.css'
import adminStyles from '@/components/admin/Shared.module.css'

export default function AdminEducationPage() {
  const [educations, setEducations] = useState<Education[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Education | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<EducationFormData>({
    resolver: zodResolver(EducationSchema),
    defaultValues: {
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      order: 0
    }
  })

  useEffect(() => {
    fetchEducations()
  }, [])

  useEffect(() => {
    if (editingItem) {
      reset({
        institution: editingItem.institution,
        degree: editingItem.degree,
        field: editingItem.field,
        startDate: editingItem.startDate,
        endDate: editingItem.endDate,
        order: editingItem.order
      })
    } else {
      reset({
        institution: '',
        degree: '',
        field: '',
        startDate: '',
        endDate: '',
        order: 0
      })
    }
  }, [editingItem, reset])

  const fetchEducations = async () => {
    try {
      const res = await fetch('/api/education')
      if (res.ok) {
        const data = await res.json()
        setEducations(data)
      }
    } catch (error) {
      console.error('Failed to fetch education:', error)
      toast.error('Failed to load education')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: EducationFormData) => {
    try {
      const url = editingItem ? `/api/education/${editingItem.id}` : '/api/education'
      const method = editingItem ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error('Failed to save education')

      toast.success(editingItem ? 'Education updated' : 'Education created')
      fetchEducations()
      setIsModalOpen(false)
    } catch (error) {
      console.error('Failed to save education:', error)
      toast.error('Failed to save education')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this education?')) return

    try {
      const res = await fetch(`/api/education/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setEducations(educations.filter(e => e.id !== id))
        toast.success('Education deleted')
      } else {
        throw new Error('Failed to delete')
      }
    } catch (error) {
      console.error('Failed to delete education:', error)
      toast.error('Failed to delete education')
    }
  }

  const handleEdit = (item: Education) => {
    setEditingItem(item)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setEditingItem(null)
    setIsModalOpen(true)
  }

  const columns: Column<Education>[] = [
    { header: 'Institution', accessorKey: 'institution' },
    { header: 'Degree', accessorKey: 'degree' },
    { header: 'Field', accessorKey: 'field' },
    { 
      header: 'Period', 
      cell: (item) => <span>{item.startDate} — {item.endDate}</span> 
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
        <h1>Education</h1>
        <p>Manage your educational background</p>
      </header>

      <AdminTable 
        data={educations}
        columns={columns}
        isLoading={loading}
        onAdd={handleAdd}
        addButtonLabel="Add Education"
        emptyMessage="No education yet"
        emptyIcon={GraduationCap}
      />

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Education' : 'Add Education'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className={formStyles.form}>
          <div className={formStyles.row}>
            <div className={formStyles.group}>
              <label>Institution</label>
              <input type="text" {...register('institution')} className={formStyles.input} />
              {errors.institution && <span className="text-red-500 text-xs">{errors.institution.message}</span>}
            </div>
            <div className={formStyles.group}>
              <label>Order</label>
              <input type="number" {...register('order', { valueAsNumber: true })} className={formStyles.input} />
            </div>
          </div>

          <div className={formStyles.row}>
            <div className={formStyles.group}>
              <label>Degree</label>
              <input type="text" {...register('degree')} placeholder="e.g., Bachelor's" className={formStyles.input} />
              {errors.degree && <span className="text-red-500 text-xs">{errors.degree.message}</span>}
            </div>
            <div className={formStyles.group}>
              <label>Field of Study</label>
              <input type="text" {...register('field')} placeholder="e.g., Computer Science" className={formStyles.input} />
              {errors.field && <span className="text-red-500 text-xs">{errors.field.message}</span>}
            </div>
          </div>

          <div className={formStyles.row}>
            <div className={formStyles.group}>
              <label>Start Date</label>
              <input type="text" {...register('startDate')} placeholder="e.g., 2019" className={formStyles.input} />
              {errors.startDate && <span className="text-red-500 text-xs">{errors.startDate.message}</span>}
            </div>
            <div className={formStyles.group}>
              <label>End Date</label>
              <input type="text" {...register('endDate')} placeholder="e.g., 2023" className={formStyles.input} />
              {errors.endDate && <span className="text-red-500 text-xs">{errors.endDate.message}</span>}
            </div>
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
                  Save Education
                </>
              )}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  )
}


'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Skill } from '@prisma/client'
import { Edit, Save, Trash2, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import AdminModal from '@/components/admin/AdminModal'
import AdminTable, { Column } from '@/components/admin/AdminTable'
import { SkillFormData, SkillSchema } from '@/lib/schemas'

import formStyles from '@/components/admin/AdminForm.module.css'
import tableStyles from '@/components/admin/AdminTable.module.css'
import adminStyles from '@/components/admin/Shared.module.css'

export default function AdminSkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Skill | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<SkillFormData>({
    resolver: zodResolver(SkillSchema),
    defaultValues: {
      name: '',
      category: 'frontend',
      percentage: 50,
      iconUrl: '',
      order: 0
    }
  })

  useEffect(() => {
    fetchSkills()
  }, [])

  useEffect(() => {
    if (editingItem) {
      reset({
        name: editingItem.name,
        category: editingItem.category,
        percentage: editingItem.percentage,
        iconUrl: editingItem.iconUrl || '',
        order: editingItem.order
      })
    } else {
      reset({
        name: '',
        category: 'frontend',
        percentage: 50,
        iconUrl: '',
        order: 0
      })
    }
  }, [editingItem, reset])

  const fetchSkills = async () => {
    try {
      const res = await fetch('/api/skills')
      if (res.ok) {
        const data = await res.json()
        setSkills(data)
      }
    } catch (error) {
      console.error('Failed to fetch skills:', error)
      toast.error('Failed to load skills')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: SkillFormData) => {
    try {
      const url = editingItem ? `/api/skills/${editingItem.id}` : '/api/skills'
      const method = editingItem ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error('Failed to save skill')

      toast.success(editingItem ? 'Skill updated' : 'Skill created')
      fetchSkills()
      setIsModalOpen(false)
    } catch (error) {
      console.error('Failed to save skill:', error)
      toast.error('Failed to save skill')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this skill?')) return

    try {
      const res = await fetch(`/api/skills/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setSkills(skills.filter(s => s.id !== id))
        toast.success('Skill deleted')
      } else {
        throw new Error('Failed to delete')
      }
    } catch (error) {
      console.error('Failed to delete skill:', error)
      toast.error('Failed to delete skill')
    }
  }

  const handleEdit = (item: Skill) => {
    setEditingItem(item)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setEditingItem(null)
    setIsModalOpen(true)
  }

  const columns: Column<Skill>[] = [
    { header: 'Skill', accessorKey: 'name' },
    { 
      header: 'Category', 
      accessorKey: 'category',
      cell: (item) => <span className={`${tableStyles.categoryBadge} uppercase`}>{item.category}</span>
    },
    { 
      header: 'Percentage', 
      cell: (item) => (
        <div className="flex items-center gap-2">
        <div className="w-24 h-2 bg-gray-700 rounded-[10px] overflow-hidden">
            <div 
              className="h-full bg-blue-500" 
              style={{ width: `${item.percentage}%` }}
            />
          </div>
          <span className="text-xs text-gray-400">{item.percentage}%</span>
        </div>
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
        <h1>Skills</h1>
        <p>Manage your technical skills</p>
      </header>

      <AdminTable 
        data={skills}
        columns={columns}
        isLoading={loading}
        onAdd={handleAdd}
        addButtonLabel="Add Skill"
        emptyMessage="No skills yet"
        emptyIcon={Zap}
      />

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Skill' : 'Add Skill'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className={formStyles.form}>
          <div className={formStyles.row}>
            <div className={formStyles.group}>
              <label>Skill Name</label>
              <input type="text" {...register('name')} className={formStyles.input} />
              {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
            </div>
            <div className={formStyles.group}>
              <label>Order</label>
              <input type="number" {...register('order', { valueAsNumber: true })} className={formStyles.input} />
            </div>
          </div>

          <div className={formStyles.row}>
            <div className={formStyles.group}>
              <label>Category</label>
              <select {...register('category')} className={formStyles.select}>
                <option value="frontend">Frontend</option>
                <option value="backend">Backend</option>
                <option value="database">Database</option>
                <option value="tools">Tools</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className={formStyles.group}>
              <label>Percentage (%)</label>
              <input 
                type="number" 
                min="0" 
                max="100" 
                {...register('percentage', { valueAsNumber: true })} 
                className={formStyles.input}
              />
              {errors.percentage && <span className="text-red-500 text-xs">{errors.percentage.message}</span>}
            </div>
          </div>

          <div className={formStyles.group}>
            <label>Icon URL (Optional)</label>
            <input type="text" {...register('iconUrl')} placeholder="e.g. logo-react" className={formStyles.input} />
            <p className="text-xs text-gray-500 mt-1">Can be an IonIcon name or an image URL</p>
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
                  Save Skill
                </>
              )}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  )
}

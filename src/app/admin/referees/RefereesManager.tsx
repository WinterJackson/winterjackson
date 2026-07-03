'use client'

import { createReferee, deleteReferee, updateReferee } from '@/app/actions/referees'
import { RefereeFormData, RefereeSchema } from '@/lib/schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { Referee } from '@prisma/client'
import { Edit, Plus, Save, Trash2, UserCheck } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import AdminModal from '@/components/admin/AdminModal'
import AdminTable, { Column } from '@/components/admin/AdminTable'

import formStyles from '@/components/admin/AdminForm.module.css'
import tableStyles from '@/components/admin/AdminTable.module.css'
import adminStyles from '@/components/admin/Shared.module.css'

interface Props {
  initialReferees: Referee[]
}

export default function RefereesManager({ initialReferees }: Props) {
  const [referees, setReferees] = useState<Referee[]>(initialReferees)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Referee | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<RefereeFormData>({
    resolver: zodResolver(RefereeSchema),
    defaultValues: {
      name: '',
      role: '',
      company: '',
      phone: '',
      email: '',
      order: 0
    }
  })

  const handleOpenModal = (item?: Referee) => {
    if (item) {
      setEditingItem(item)
      reset({
        name: item.name,
        role: item.role,
        company: item.company,
        phone: item.phone,
        email: item.email || '',
        order: item.order
      })
    } else {
      setEditingItem(null)
      reset({
        name: '',
        role: '',
        company: '',
        phone: '',
        email: '',
        order: referees.length
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingItem(null)
    reset()
  }

  const onSubmit = async (data: RefereeFormData) => {
    try {
      if (editingItem) {
        const res = await updateReferee(editingItem.id, data)
        if (res.success) {
          toast.success('Referee updated successfully')
          // Optimistic update
          setReferees(referees.map(r => r.id === editingItem.id ? { ...r, ...data, email: data.email || null } : r))
          handleCloseModal()
        } else {
          toast.error(res.error || 'Failed to update')
        }
      } else {
        const res = await createReferee(data)
        if (res.success) {
          toast.success('Referee added successfully')
          window.location.reload()
        } else {
          toast.error(res.error || 'Failed to add')
        }
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this referee?')) {
      try {
        const res = await deleteReferee(id)
        if (res.success) {
          toast.success('Referee deleted')
          setReferees(referees.filter(r => r.id !== id))
        } else {
          toast.error(res.error || 'Failed to delete')
        }
      } catch (error) {
        toast.error('An error occurred')
      }
    }
  }

  const columns: Column<Referee>[] = [
    { header: 'Name', accessorKey: 'name' },
    { header: 'Role', accessorKey: 'role' },
    { header: 'Company', accessorKey: 'company' },
    { header: 'Phone', accessorKey: 'phone' },
    { header: 'Order', accessorKey: 'order' },
    {
      header: 'Actions',
      cell: (item: Referee) => (
        <div className={tableStyles.actionButtons}>
          <button
            onClick={() => handleOpenModal(item)}
            className={tableStyles.editBtn}
            title="Edit"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => handleDelete(item.id)}
            className={tableStyles.deleteBtn}
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )
    }
  ]

  return (
    <div className={adminStyles.page}>
      <header className={adminStyles.pageHeader}>
        <h1>Referees</h1>
        <p>Manage your professional references</p>
      </header>

      <AdminTable
        columns={columns}
        data={referees}
        isLoading={false}
        onAdd={() => handleOpenModal()}
        addButtonLabel="Add Referee"
        emptyMessage="No referees found. Add your first one!"
        emptyIcon={UserCheck}
      />

      <AdminModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingItem ? 'Edit Referee' : 'Add Referee'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className={formStyles.form}>
          <div className={formStyles.row}>
            <div className={formStyles.group}>
              <label>Name</label>
              <input
                type="text"
                {...register('name')}
                className={formStyles.input}
                placeholder="e.g. John Doe"
              />
              {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
            </div>

            <div className={formStyles.group}>
              <label>Role / Title</label>
              <input
                type="text"
                {...register('role')}
                className={formStyles.input}
                placeholder="e.g. Project Manager"
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
                placeholder="e.g. Tech Corp"
              />
              {errors.company && <span className="text-red-500 text-xs">{errors.company.message}</span>}
            </div>

            <div className={formStyles.group}>
              <label>Phone Number</label>
              <input
                type="text"
                {...register('phone')}
                className={formStyles.input}
                placeholder="e.g. +254 700 000 000"
              />
              {errors.phone && <span className="text-red-500 text-xs">{errors.phone.message}</span>}
            </div>
          </div>

          <div className={formStyles.row}>
            <div className={formStyles.group}>
              <label>Email (Optional)</label>
              <input
                type="email"
                {...register('email')}
                className={formStyles.input}
                placeholder="e.g. john@example.com"
              />
              {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
            </div>

            <div className={formStyles.group}>
              <label>Display Order</label>
              <input
                type="number"
                {...register('order', { valueAsNumber: true })}
                className={formStyles.input}
              />
            </div>
          </div>

          <div className={formStyles.actions}>
            <button type="button" onClick={handleCloseModal} className={formStyles.cancelBtn}>
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
                  <Save size={18} />
                  Save Referee
                </>
              )}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  )
}

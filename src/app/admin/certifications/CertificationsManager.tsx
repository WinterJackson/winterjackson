'use client'

import { createCertification, deleteCertification, updateCertification } from '@/app/actions/certifications'
import { CertificationFormData, CertificationSchema } from '@/lib/schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { Certification } from '@prisma/client'
import { BadgeCheck, Edit, Plus, Save, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import AdminModal from '@/components/admin/AdminModal'
import AdminTable, { Column } from '@/components/admin/AdminTable'

import formStyles from '@/components/admin/AdminForm.module.css'
import tableStyles from '@/components/admin/AdminTable.module.css'
import adminStyles from '@/components/admin/Shared.module.css'

interface Props {
  initialCertifications: Certification[]
}

export default function CertificationsManager({ initialCertifications }: Props) {
  const [certifications, setCertifications] = useState<Certification[]>(initialCertifications)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Certification | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<CertificationFormData>({
    resolver: zodResolver(CertificationSchema),
    defaultValues: {
      name: '',
      issuer: '',
      date: '',
      order: 0
    }
  })

  const handleOpenModal = (item?: Certification) => {
    if (item) {
      setEditingItem(item)
      reset({
        name: item.name,
        issuer: item.issuer,
        date: item.date || '',
        order: item.order
      })
    } else {
      setEditingItem(null)
      reset({
        name: '',
        issuer: '',
        date: '',
        order: certifications.length
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingItem(null)
    reset()
  }

  const onSubmit = async (data: CertificationFormData) => {
    try {
      if (editingItem) {
        const res = await updateCertification(editingItem.id, data)
        if (res.success) {
          toast.success('Certification updated successfully')
          // Optimistic update
          setCertifications(certifications.map(c => c.id === editingItem.id ? { ...c, ...data, date: data.date || null } : c))
          handleCloseModal()
        } else {
          toast.error(res.error || 'Failed to update')
        }
      } else {
        const res = await createCertification(data)
        if (res.success) {
          toast.success('Certification added successfully')
          // Soft refresh by reloading page, or we could just reload data
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
    if (confirm('Are you sure you want to delete this certification?')) {
      try {
        const res = await deleteCertification(id)
        if (res.success) {
          toast.success('Certification deleted')
          setCertifications(certifications.filter(c => c.id !== id))
        } else {
          toast.error(res.error || 'Failed to delete')
        }
      } catch (error) {
        toast.error('An error occurred')
      }
    }
  }

  const columns: Column<Certification>[] = [
    { header: 'Name', accessorKey: 'name' },
    { header: 'Issuer', accessorKey: 'issuer' },
    { header: 'Date', accessorKey: 'date' },
    { header: 'Order', accessorKey: 'order' },
    {
      header: 'Actions',
      cell: (item: Certification) => (
        <div className={tableStyles.actions}>
          <button
            onClick={() => handleOpenModal(item)}
            className={`${tableStyles.actionBtn} ${tableStyles.editBtn}`}
            title="Edit"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => handleDelete(item.id)}
            className={`${tableStyles.actionBtn} ${tableStyles.deleteBtn}`}
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )
    }
  ]

  return (
    <div className={adminStyles.container}>
      <div className={adminStyles.header}>
        <div className={adminStyles.titleGroup}>
          <BadgeCheck className={adminStyles.titleIcon} />
          <h2 className={adminStyles.title}>Certifications</h2>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className={adminStyles.primaryBtn}
        >
          <Plus size={20} />
          Add Certification
        </button>
      </div>

      <div className={adminStyles.content}>
        <AdminTable
          columns={columns}
          data={certifications}
          isLoading={false}
          emptyMessage="No certifications found. Add your first one!"
        />
      </div>

      <AdminModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingItem ? 'Edit Certification' : 'Add Certification'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className={formStyles.form}>
          <div className={formStyles.group}>
            <label className={formStyles.label}>Certification Name</label>
            <input
              type="text"
              {...register('name')}
              className={`${formStyles.input} ${errors.name ? formStyles.inputError : ''}`}
              placeholder="e.g. AWS Certified Solutions Architect"
            />
            {errors.name && <span className={formStyles.errorMessage}>{errors.name.message}</span>}
          </div>

          <div className={formStyles.group}>
            <label className={formStyles.label}>Issuer</label>
            <input
              type="text"
              {...register('issuer')}
              className={`${formStyles.input} ${errors.issuer ? formStyles.inputError : ''}`}
              placeholder="e.g. Amazon Web Services"
            />
            {errors.issuer && <span className={formStyles.errorMessage}>{errors.issuer.message}</span>}
          </div>

          <div className={formStyles.group}>
            <label className={formStyles.label}>Date (Optional)</label>
            <input
              type="text"
              {...register('date')}
              className={`${formStyles.input} ${errors.date ? formStyles.inputError : ''}`}
              placeholder="e.g. 2024"
            />
          </div>

          <div className={formStyles.group}>
            <label className={formStyles.label}>Display Order</label>
            <input
              type="number"
              {...register('order', { valueAsNumber: true })}
              className={`${formStyles.input} ${errors.order ? formStyles.inputError : ''}`}
            />
            {errors.order && <span className={formStyles.errorMessage}>{errors.order.message}</span>}
          </div>

          <div className={formStyles.actions}>
            <button
              type="button"
              onClick={handleCloseModal}
              className={formStyles.cancelBtn}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={formStyles.submitBtn}
            >
              <Save size={20} />
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  )
}

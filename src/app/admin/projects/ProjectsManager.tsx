'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Project } from '@prisma/client'
import { Edit, FolderOpen, Save, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import { createProject, deleteProject, getProjects, updateProject } from '@/app/actions/projects'
import AdminModal from '@/components/admin/AdminModal'
import AdminTable, { Column } from '@/components/admin/AdminTable'
import ImageUpload from '@/components/admin/ImageUpload'
import { ProjectFormData, ProjectSchema } from '@/lib/schemas'

import formStyles from '@/components/admin/AdminForm.module.css'
import tableStyles from '@/components/admin/AdminTable.module.css'
import adminStyles from '@/components/admin/Shared.module.css'
import tooltipStyles from '@/components/admin/Tooltips.module.css'

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<ProjectFormData>({
    resolver: zodResolver(ProjectSchema),
    defaultValues: {
      title: '',
      category: 'web development',
      categories: ['web development'],
      description: '',
      imageUrl: '',
      isActive: true,
      order: 0
    }
  })

  useEffect(() => {
    fetchProjects()
  }, [])

  useEffect(() => {
    if (editingProject) {
      reset({
        title: editingProject.title,
        category: editingProject.category,
        categories: editingProject.categories,
        description: editingProject.description,
        imageUrl: editingProject.imageUrl,
        webpUrl: editingProject.webpUrl || '',
        demoUrl: editingProject.demoUrl || '',
        githubUrl: editingProject.githubUrl || '',
        isActive: editingProject.isActive,
        order: editingProject.order
      })
    } else {
      reset({
        title: '',
        category: 'web development',
        categories: ['web development'],
        description: '',
        imageUrl: '',
        isActive: true,
        order: 0
      })
    }
  }, [editingProject, reset])

  const fetchProjects = async () => {
    try {
      const data = await getProjects()
      setProjects(data)
    } catch (error) {
      console.error('Failed to fetch projects:', error)
      toast.error('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: ProjectFormData) => {
    try {
      // Sync categories with primary category for simplicity
      const payload = {
        ...data,
        categories: [data.category]
      }

      let res
      if (editingProject) {
        res = await updateProject(editingProject.id, payload)
      } else {
        res = await createProject(payload)
      }

      if (!res.success) throw new Error(res.error)

      toast.success(editingProject ? 'Project updated' : 'Project created')
      fetchProjects()
      setIsModalOpen(false)
    } catch (error) {
      console.error('Failed to save project:', error)
      toast.error('Failed to save project')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return

    try {
      const res = await deleteProject(id)
      if (res.success) {
        setProjects(projects.filter(p => p.id !== id))
        toast.success('Project deleted')
      } else {
        throw new Error(res.error)
      }
    } catch (error) {
      console.error('Failed to delete project:', error)
      toast.error('Failed to delete project')
    }
  }

  const handleEdit = (project: Project) => {
    setEditingProject(project)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setEditingProject(null)
    setIsModalOpen(true)
  }

  const columns: Column<Project>[] = [
    { header: 'Title', accessorKey: 'title' },
    { 
      header: 'Category', 
      accessorKey: 'category',
      cell: (item) => <span className={tableStyles.categoryBadge}>{item.category}</span>
    },
    {
      header: 'Image',
      cell: (item) => (
        <div className="w-[50px] h-[35px] relative rounded-[10px] overflow-hidden">
             <Image 
                src={item.imageUrl} 
                alt={item.title} 
                width={50} 
                height={35}
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
             />
        </div>
      )
    },
    { 
      header: 'Status', 
      cell: (item) => (
        <span className={`${tableStyles.statusBadge} ${item.isActive ? tableStyles.active : tableStyles.inactive}`}>
          {item.isActive ? 'Active' : 'Hidden'}
        </span>
      )
    },
    {
      header: 'Actions',
      cell: (item) => (
        <div className={tableStyles.actionButtons}>
          <button 
            onClick={() => handleEdit(item)} 
            className={`${tableStyles.editBtn} ${tooltipStyles.tooltip} ${tooltipStyles.left}`}
            data-tooltip="Edit Project"
          >
            <Edit size={18} />
          </button>
          <button 
            onClick={() => handleDelete(item.id)} 
            className={`${tableStyles.deleteBtn} ${tooltipStyles.tooltip} ${tooltipStyles.left}`}
            data-tooltip="Delete Project"
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
        <h1>Projects</h1>
        <p>Manage your portfolio projects</p>
      </header>

      <AdminTable 
        data={projects}
        columns={columns}
        isLoading={loading}
        onAdd={handleAdd}
        addButtonLabel="Add Project"
        emptyMessage="No projects yet"
        emptyIcon={FolderOpen}
      />

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? 'Edit Project' : 'Add Project'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className={formStyles.form}>
          <div className={formStyles.row}>
            <div className={formStyles.group}>
              <label>Title</label>
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
              <option value="web development">Web Development</option>
              <option value="applications">Applications</option>
              <option value="web design">Web Design</option>
              <option value="personal projects">Personal Projects</option>
            </select>
          </div>

          <div className={formStyles.group}>
            <label>Description</label>
            <textarea rows={4} {...register('description')} className={formStyles.textarea} />
            {errors.description && <span className="text-red-500 text-xs">{errors.description.message}</span>}
          </div>

          <div className={formStyles.group}>
             <ImageUpload 
                value={watch('imageUrl')} 
                onChange={(url) => setValue('imageUrl', url)} 
                label="Project Image"
             />
             {errors.imageUrl && <span className="text-red-500 text-xs">{errors.imageUrl.message}</span>}
          </div>

          <div className={formStyles.row}>
            <div className={formStyles.group}>
              <label>Demo URL</label>
              <input type="text" {...register('demoUrl')} className={formStyles.input} />
            </div>
            <div className={formStyles.group}>
              <label>GitHub URL</label>
              <input type="text" {...register('githubUrl')} className={formStyles.input} />
            </div>
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
                  Save Project
                </>
              )}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  )
}


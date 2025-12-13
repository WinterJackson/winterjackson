'use client'

import { Box, Plus } from 'lucide-react'
import React, { ElementType } from 'react'
import styles from './AdminTable.module.css'

export interface Column<T> {
  header: string
  accessorKey?: keyof T
  cell?: (item: T) => React.ReactNode
  className?: string
}

interface AdminTableProps<T> {
  data: T[]
  columns: Column<T>[]
  isLoading: boolean
  onAdd?: () => void
  addButtonLabel?: string
  emptyMessage?: string
  emptyIcon?: ElementType
}

export default function AdminTable<T extends { id: string }>({
  data,
  columns,
  isLoading,
  onAdd,
  addButtonLabel = 'Add Item',
  emptyMessage = 'No items found',
  emptyIcon: EmptyIcon = Box,
}: AdminTableProps<T>) {
  if (isLoading) {
    return <div className="loading">Loading...</div>
  }

  if (data.length === 0) {
    return (
      <div className={styles.emptyState}>
        <EmptyIcon className={styles.emptyStateIcon} />
        <h3>{emptyMessage}</h3>
        {onAdd && (
          <button onClick={onAdd} className={`${styles.addBtn} ${styles.emptyStateAddBtn}`}>
            <Plus />
            {addButtonLabel}
          </button>
        )}
      </div>
    )
  }

  return (
    <>
      {onAdd && (
        <button onClick={onAdd} className={styles.addBtn}>
          <Plus />
          {addButtonLabel}
        </button>
      )}
      
      <div className={styles.container}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th key={index} className={col.className}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id}>
                {columns.map((col, index) => (
                  <td key={index} className={col.className}>
                    {col.cell
                      ? col.cell(item)
                      : col.accessorKey
                      ? (item[col.accessorKey] as React.ReactNode)
                      : null}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

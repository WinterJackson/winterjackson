export * from '@prisma/client'

export interface ApiResponse<T> {
    data?: T
    error?: string
    message?: string
}

export interface AdminNavItem {
    href: string
    label: string
    icon: string
}

import { Briefcase, Building, Code, GraduationCap, LayoutDashboard, Mail, MessageSquare, Settings, User, Users, Zap } from 'lucide-react'

export const adminNavItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, color: '#8b5cf6' },
    { name: 'Messages', path: '/admin/messages', icon: Mail, color: '#ec4899' },
    { name: 'Clients', path: '/admin/clients', icon: Users, color: '#3b82f6' }, // Blue
    { name: 'Profile', path: '/admin/profile', icon: User, color: '#ec4899' }, // Pink
    { name: 'Services', path: '/admin/services', icon: Briefcase, color: '#f59e0b' }, // Amber
    { name: 'Projects', path: '/admin/projects', icon: Code, color: '#8b5cf6' }, // Violet
    { name: 'Experience', path: '/admin/experience', icon: Building, color: '#14b8a6' }, // Teal
    { name: 'Education', path: '/admin/education', icon: GraduationCap, color: '#ef4444' }, // Red
    { name: 'Skills', path: '/admin/skills', icon: Zap, color: '#eab308' }, // Yellow
    { name: 'Testimonials', path: '/admin/testimonials', icon: MessageSquare, color: '#10b981' }, // Emerald
    { name: 'Settings', path: '/admin/settings', icon: Settings, color: '#64748b' }, // Slate
]

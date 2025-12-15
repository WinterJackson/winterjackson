import { z } from 'zod'

export const ServiceSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    iconUrl: z.string().min(1, 'Icon URL is required'),
    order: z.number().int(),
    category: z.string(), // 'service' or 'venture'
})

export const ClientSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    logoUrl: z.string().min(1, 'Logo URL is required'),
    order: z.number().int(),
    isActive: z.boolean(),
})

export const SiteSettingsSchema = z.object({
    maintenanceMode: z.boolean(),
    siteUrl: z.string().optional(),
    metaTitle: z.string().min(1, "Meta Title is required"),
    metaDescription: z.string().min(1, "Meta Description is required"),
    metaKeywords: z.string().min(1, "Keywords are required"),
    ogImageUrl: z.string().optional(),

    // Identity
    showResumeDownload: z.boolean(),
    logoUrl: z.string().optional(),
    footerText: z.string().min(1, "Footer Text is required"),

    // Features
    showTestimonials: z.boolean(),
    showProjects: z.boolean(),
    showServices: z.boolean(),
    showBlog: z.boolean().optional(),

    // Contact
    contactEmail: z.string().email("Invalid email address"),

    // Analytics
    googleAnalyticsId: z.string().optional(),

    // Theme
    primaryColor: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, "Invalid Hex Color code"),
})

export const ProjectSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    category: z.string().min(1, 'Primary category is required'),
    categories: z.array(z.string()),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    imageUrl: z.string().min(1, 'Image URL is required'),
    webpUrl: z.string().optional().or(z.literal('')),
    demoUrl: z.string().optional().or(z.literal('')),
    githubUrl: z.string().optional().or(z.literal('')),
    order: z.number().int(),
    isActive: z.boolean(),
})

export const EducationSchema = z.object({
    institution: z.string().min(1, 'Institution is required'),
    degree: z.string().min(1, 'Degree is required'),
    field: z.string().min(1, 'Field of study is required'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    order: z.number().int(),
})

export const ExperienceSchema = z.object({
    jobTitle: z.string().min(1, 'Job title is required'),
    company: z.string().min(1, 'Company is required'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().optional().or(z.literal('')),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    order: z.number().int(),
})

export const SkillSchema = z.object({
    name: z.string().min(1, 'Skill name is required'),
    percentage: z.number().min(0).max(100),
    category: z.string().min(1, 'Category is required'),
    iconUrl: z.string().optional().or(z.literal('')),
    order: z.number().int(),
})

export const TestimonialSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    role: z.string().min(1, 'Role is required'),
    company: z.string().optional().or(z.literal('')),
    text: z.string().min(10, 'Testimonial text must be at least 10 characters'),
    linkedinUrl: z.string().optional().or(z.literal('')),
    avatarUrl: z.string().optional().or(z.literal('')),
    isActive: z.boolean(),
    order: z.number().int(),
})

export const ProfileSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    title: z.string().min(1, 'Title is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(1, 'Phone number is required'),
    altPhone: z.string().optional().or(z.literal('')),
    location: z.string().min(1, 'Location is required'),
    bio: z.string().min(10, 'Bio must be at least 10 characters'),
    avatarUrl: z.string().optional().or(z.literal('')),
    profileVideoUrl: z.string().optional().or(z.literal('')),
    github: z.string().optional().or(z.literal('')),
    linkedin: z.string().optional().or(z.literal('')),
    whatsapp: z.string().optional().or(z.literal('')),
    cvUrl: z.string().optional().or(z.literal('')),
})

// Password Change Schema
export const PasswordChangeSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password')
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

export type PasswordChangeFormData = z.infer<typeof PasswordChangeSchema>

// Email Change Schema
export const EmailChangeSchema = z.object({
    newEmail: z.string().email('Invalid email address'),
    currentPassword: z.string().min(1, 'Current password is required to confirm changes'),
})

export type EmailChangeFormData = z.infer<typeof EmailChangeSchema>

export type ServiceFormData = z.infer<typeof ServiceSchema>
export type ProjectFormData = z.infer<typeof ProjectSchema>
export type EducationFormData = z.infer<typeof EducationSchema>
export type ExperienceFormData = z.infer<typeof ExperienceSchema>
export type SkillFormData = z.infer<typeof SkillSchema>
export type TestimonialFormData = z.infer<typeof TestimonialSchema>
export type ProfileFormData = z.infer<typeof ProfileSchema>
export type SiteSettingsFormData = z.infer<typeof SiteSettingsSchema>
export type ClientFormData = z.infer<typeof ClientSchema>

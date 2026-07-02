import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import { NextResponse } from 'next/server'
import path from 'path'

const ENV_PATH = path.join(process.cwd(), '.env')

// Keys that are safe to display and edit from the admin UI
const ALLOWED_KEYS = new Set([
    'DATABASE_URL',
    'NEXTAUTH_URL',
    'AUTH_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
    'NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET',
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASSWORD'
])

// Keys whose values must be masked in GET responses to prevent secret leakage
const SENSITIVE_KEY_PATTERNS = ['SECRET', 'PASSWORD', 'TOKEN', 'DATABASE_URL']

/**
 * Masks a sensitive value for safe display in the admin UI.
 * Shows only the first 4 and last 4 characters for long values.
 */
function maskSensitiveValue(key: string, value: string): string {
    const isSensitive = SENSITIVE_KEY_PATTERNS.some(pattern => key.toUpperCase().includes(pattern))
    if (!isSensitive || !value) return value

    if (value.length <= 12) {
        return '***REDACTED***'
    }
    return `${value.slice(0, 4)}***REDACTED***${value.slice(-4)}`
}

export async function GET() {
    const session = await auth()
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        let envContent = ''
        if (fs.existsSync(ENV_PATH)) {
            envContent = fs.readFileSync(ENV_PATH, 'utf-8')
        }

        const envs: Record<string, string> = {}

        // Parse the .env file
        envContent.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/)
            if (match) {
                const key = match[1].trim()
                let value = match[2].trim()

                // Remove quotes if they exist
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.slice(1, -1)
                }

                envs[key] = value
            }
        })

        // Filter to only return allowed keys, and mask sensitive values
        const filteredEnvs: Record<string, string> = {}
        ALLOWED_KEYS.forEach(key => {
            const rawValue = envs[key] || ''
            filteredEnvs[key] = maskSensitiveValue(key, rawValue)
        })

        return NextResponse.json(filteredEnvs)
    } catch (error) {
        console.error('Error reading env file:', error)
        return NextResponse.json({ error: 'Failed to read environment variables' }, { status: 500 })
    }
}

export async function PUT(req: Request) {
    const session = await auth()
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { currentPassword, ...updates } = body as Record<string, string>

        if (!currentPassword) {
            return NextResponse.json({ error: 'Password is required' }, { status: 400 })
        }

        // Verify password
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user || !user.password) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const isValid = await bcrypt.compare(currentPassword, user.password)

        if (!isValid) {
            return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
        }

        // Filter updates against the strict allowlist
        const filteredUpdates: Record<string, string> = {}
        Object.keys(updates).forEach(key => {
            if (ALLOWED_KEYS.has(key)) {
                filteredUpdates[key] = updates[key]
            }
        })

        if (Object.keys(filteredUpdates).length === 0) {
            return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
        }

        // Audit log for environment variable changes
        const changedKeys = Object.keys(filteredUpdates)
        console.log(`[ENV AUDIT] ${new Date().toISOString()} | User: ${session.user.email} | Keys updated: ${changedKeys.join(', ')}`)

        let envContent = ''
        if (fs.existsSync(ENV_PATH)) {
            envContent = fs.readFileSync(ENV_PATH, 'utf-8')
        }

        let lines = envContent.split('\n')
        const seenKeys = new Set<string>()

        // Update existing keys
        lines = lines.map(line => {
            const match = line.match(/^([^=]+)=(.*)$/)
            if (match) {
                const key = match[1].trim()
                seenKeys.add(key)
                if (filteredUpdates.hasOwnProperty(key)) {
                    const val = filteredUpdates[key]
                    // Consistently quote values that contain spaces or special characters
                    const needsQuotes = val.includes(' ') || val.includes('#') || val.includes('=')
                    return `${key}=${needsQuotes ? `"${val}"` : val}`
                }
            }
            return line
        })

        // Add new keys that weren't in the file
        Object.keys(filteredUpdates).forEach(key => {
            if (!seenKeys.has(key)) {
                const val = filteredUpdates[key]
                const needsQuotes = val.includes(' ') || val.includes('#') || val.includes('=')
                lines.push(`${key}=${needsQuotes ? `"${val}"` : val}`)
            }
        })

        // Remove empty lines at end to prevent buildup
        while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
            lines.pop()
        }

        fs.writeFileSync(ENV_PATH, lines.join('\n') + '\n')

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error writing env file:', error)
        return NextResponse.json({ error: 'Failed to update environment variables' }, { status: 500 })
    }
}

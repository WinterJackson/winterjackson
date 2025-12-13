import {
    Briefcase,
    CalendarDays,
    Camera,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Code,
    Cpu,
    Database,
    Edit,
    Eye,
    Facebook,
    FileText,
    Github,
    Globe,
    Home,
    Instagram,
    Layout,
    Linkedin,
    LogOut,
    LucideProps,
    Mail,
    MapPin,
    Menu,
    Monitor,
    PenTool,
    Phone,
    Plus,
    Server,
    Settings,
    Smartphone,
    Terminal,
    Trash2,
    Twitter,
    User,
    Wrench,
    X
} from 'lucide-react'

// Generic map for direct Lucide names
// We can extend this as needed
export const IconMap: Record<string, React.ComponentType<LucideProps>> = {
  // Common Contact
  mail: Mail,
  email: Mail,
  phone: Phone,
  mobile: Smartphone,
  location: MapPin,
  calendar: CalendarDays,
  
  // Socials
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  instagram: Instagram,
  facebook: Facebook,
  website: Globe, // generic web

  // Tech / Services
  monitor: Monitor,
  laptop: Monitor,
  code: Code,
  terminal: Terminal,
  cpu: Cpu,
  database: Database,
  layout: Layout,
  server: Server,
  wrench: Wrench,
  tool: Wrench,
  design: PenTool,
  camera: Camera,
  
  // UI
  home: Home,
  user: User,
  settings: Settings,
  briefcase: Briefcase,
  file: FileText,
  eye: Eye,
  trash: Trash2,
  edit: Edit,
  plus: Plus,
  close: X,
  menu: Menu,
  'chevron-down': ChevronDown,
  'chevron-right': ChevronRight,
  'chevron-left': ChevronLeft,
  logout: LogOut,
}

// Special mapping for legacy Ionicons names that might be in the DB
export const LegacyIconMapping: Record<string, React.ComponentType<LucideProps>> = {
  'mail-outline': Mail,
  'phone-portrait-outline': Smartphone,
  'call-outline': Phone,
  'location-outline': MapPin,
  'calendar-outline': CalendarDays,
  'desktop-outline': Monitor,
  'code-slash-outline': Code,
  'logo-github': Github,
  'logo-linkedin': Linkedin,
  'logo-whatsapp': Phone, // No whatsapp icon in lucide default, mapping to Phone or MessageCircle if available (using Phone for now)
  'eye-outline': Eye,
  'chevron-down': ChevronDown,
  'chevron-down-outline': ChevronDown,
}

interface DynamicIconProps extends LucideProps {
  name: string
}

export function DynamicIcon({ name, ...props }: DynamicIconProps) {
  // 1. Try exact match in our clean dictionary
  let IconComponent = IconMap[name.toLowerCase()]

  // 2. If not found, try legacy mapping (strip whitespace just in case)
  if (!IconComponent) {
    IconComponent = LegacyIconMapping[name.toLowerCase()]
  }

  // 3. Fallback to a generic icon if still not found
  if (!IconComponent) {
    // Attempt to match lucide standard names if the user saved "Monitor" directly
    // This is optional but helpful
    return <Code {...props} /> // Fallback icon
  }

  return <IconComponent {...props} />
}

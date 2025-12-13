'use client'

import { SiteSettings } from '@prisma/client'

interface NavbarProps {
  activePage: string
  setActivePage: (page: string) => void
  settings: SiteSettings | null
}

const navItems = [
  { name: 'Services', key: 'showServices' },
  { name: 'About', key: null }, // Always shown
  { name: 'Resume', key: null }, // Always shown
  { name: 'Portfolio', key: 'showProjects' },
  { name: 'Contact', key: null }
]

export default function Navbar({ activePage, setActivePage, settings }: NavbarProps) {
  const handleNavClick = (page: string) => {
    setActivePage(page.toLowerCase())
    window.scrollTo(0, 0)
  }

  const visibleNavItems = navItems.filter(item => {
    if (!settings) return true // Default to show if settings not loaded yet
    if (item.key === 'showServices' && settings.showServices === false) return false
    if (item.key === 'showProjects' && settings.showProjects === false) return false
    return true
  })

  return (
    <nav className="navbar">
      <div className="nav-wrap">
        <ul className="navbar-list">
          {visibleNavItems.map((item) => (
            <li key={item.name} className="navbar-item">
              <button
                className={`navbar-link ${activePage === item.name.toLowerCase() ? 'active' : ''}`}
                onClick={() => handleNavClick(item.name)}
                data-nav-link
              >
                {item.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}

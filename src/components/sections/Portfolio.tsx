'use client'

import { Project } from '@prisma/client'
import { ChevronDown, Eye } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'

interface PortfolioProps {
  isActive: boolean
  projects: Project[]
}

const filters = ['All', 'Applications', 'Web development', 'Personal projects']

export default function Portfolio({ isActive, projects }: PortfolioProps) {
  const [filter, setFilter] = useState('All')
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(projects)
  const [hoveredProject, setHoveredProject] = useState<string | null>(null)
  const [isSelectOpen, setIsSelectOpen] = useState(false)

  useEffect(() => {
    if (filter === 'All') {
      setFilteredProjects(projects)
    } else {
      setFilteredProjects(projects.filter((project) => {
        const filterLower = filter.toLowerCase()
        const categoryMatch = project.category.toLowerCase() === filterLower
        const categoriesMatch = project.categories?.some(cat => cat.toLowerCase() === filterLower)
        return categoryMatch || categoriesMatch
      }))
    }
  }, [filter, projects])

  const handleFilterClick = (category: string) => {
    setFilter(category)
    setIsSelectOpen(false)
  }

  return (
    <article className={`portfolio ${isActive ? 'active' : ''}`} data-page="portfolio">
      <header>
        <h2 className="h2 article-title">Portfolio</h2>
      </header>

      <section className="projects">
        <ul className="filter-list">
          {filters.map((category) => (
            <li key={category} className="filter-item">
              <button
                className={filter === category ? 'active' : ''}
                onClick={() => handleFilterClick(category)}
                data-filter-btn
              >
                {category}
              </button>
            </li>
          ))}
        </ul>

        <div className={`filter-select-box ${isSelectOpen ? 'active' : ''}`}>
          <button 
            className={`filter-select ${isSelectOpen ? 'active' : ''}`} 
            onClick={() => setIsSelectOpen(!isSelectOpen)}
            data-select
          >
            <div className="select-value" data-selecct-value>
              {filter}
            </div>
            <div className="select-icon">
              <ChevronDown />
            </div>
          </button>

          <ul className="select-list">
            {filters.map((category) => (
              <li key={category} className="select-item">
                <button onClick={() => handleFilterClick(category)} data-select-item>
                  {category}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <ul className="project-list">
          {filteredProjects.map((project) => (
            <li 
              key={project.id} 
              className="project-item active" 
              data-filter-item 
              data-category={project.category.toLowerCase()}
              onMouseEnter={() => setHoveredProject(project.id)}
              onMouseLeave={() => setHoveredProject(null)}
            >
              <a href={project.demoUrl || project.githubUrl || '#'} target="_blank" rel="noopener noreferrer">
                <figure className="project-img">
                  <div className="project-item-icon-box">
                    <Eye />
                  </div>
                  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <Image 
                        src={project.imageUrl} 
                        alt={project.title} 
                        width={300} 
                        height={200}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                </figure>
                <h3 className="project-title">{project.title}</h3>
                <p className="project-category">{project.category}</p>
              </a>
              
              {/* GitHub and Demo Buttons */}
              <div className="project-links">
                {project.githubUrl && (
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="project-link-btn github-btn">
                    Github
                  </a>
                )}
                {project.demoUrl && (
                  <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="project-link-btn demo-btn">
                    Demo
                  </a>
                )}
              </div>

              {/* Project Description on Hover */}
              {project.description && (
                <div className={`project-description ${hoveredProject === project.id ? 'show' : ''}`}>
                  <p>{project.description}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>
    </article>
  )
}

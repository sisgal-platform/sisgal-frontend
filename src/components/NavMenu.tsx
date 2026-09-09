import { NavLink } from 'react-router'
import { MODULES } from '../modules/catalog'

type NavMenuProps = {
  /** Cierra el menú en viewport angosto tras elegir un módulo. */
  onNavigate?: () => void
}

/**
 * Menú principal. `NavLink` aplica `aria-current="page"` al módulo activo,
 * de modo que la indicación no dependa únicamente del color.
 */
export function NavMenu({ onNavigate }: NavMenuProps) {
  return (
    <nav className="nav" aria-label="Módulos del sistema">
      <ul className="nav-list">
        {MODULES.map((module) => (
          <li key={module.id}>
            <NavLink
              to={module.path}
              end={module.path === '/'}
              className={({ isActive }) =>
                isActive ? 'nav-link is-active' : 'nav-link'
              }
              onClick={onNavigate}
            >
              <svg
                className="nav-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d={module.icon} />
              </svg>
              <span>{module.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

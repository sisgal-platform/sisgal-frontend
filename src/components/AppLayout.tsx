import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import { findModuleByPath, MODULES } from '../modules/catalog'
import { useSession } from '../session/useSession'
import { NavMenu } from './NavMenu'
import { RouteAnnouncer } from './RouteAnnouncer'

/**
 * Shell administrativo: se monta una sola vez y persiste entre módulos, así el
 * cambio de ruta reemplaza únicamente el `<Outlet />` y nunca recarga la app.
 */
export function AppLayout() {
  const { pathname } = useLocation()
  const { user, lastModule, setLastModule, logout } = useSession()
  const [menuAbierto, setMenuAbierto] = useState(false)

  const moduloActual = findModuleByPath(pathname)
  const etiquetaUltimo = MODULES.find((m) => m.id === lastModule)?.label

  // El módulo visitado queda en la sesión y sobrevive a una recarga.
  useEffect(() => {
    if (moduloActual) setLastModule(moduloActual.id)
  }, [moduloActual, setLastModule])

  return (
    <div className="layout">
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>

      <header className="topbar">
        <button
          type="button"
          className="menu-toggle"
          aria-expanded={menuAbierto}
          aria-controls="menu-lateral"
          onClick={() => setMenuAbierto((abierto) => !abierto)}
        >
          <span className="sr-only">
            {menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
          </span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>

        <span className="brand">SISGAL</span>

        {user && (
          <div className="sesion">
            <span className="sesion-usuario">
              {user.nombre}
              <span className="sesion-rol">{user.rol}</span>
            </span>
            <button type="button" className="boton-sesion" onClick={logout}>
              Cerrar sesión
            </button>
          </div>
        )}
      </header>

      <div className="cuerpo">
        <aside
          id="menu-lateral"
          className={menuAbierto ? 'lateral is-abierto' : 'lateral'}
        >
          <NavMenu onNavigate={() => setMenuAbierto(false)} />
          {etiquetaUltimo && (
            <p className="pie-lateral">
              <span className="sr-only">Estado de sesión: </span>
              Último módulo: <strong>{etiquetaUltimo}</strong>
            </p>
          )}
        </aside>

        {/*
          `tabIndex={-1}` permite que RouteAnnouncer mueva el foco aquí al
          navegar; sin él el foco se quedaría en el enlace del menú.
        */}
        <main id="contenido" className="contenido" tabIndex={-1}>
          <Outlet />
        </main>
      </div>

      <RouteAnnouncer />
    </div>
  )
}

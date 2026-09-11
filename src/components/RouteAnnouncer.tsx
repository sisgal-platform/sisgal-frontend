import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router'
import { findModuleByPath } from '../modules/catalog'

/**
 * Al navegar en una SPA el navegador no anuncia el cambio de página ni mueve el
 * foco. Este componente hace ambas cosas: publica el nombre del módulo en una
 * región `aria-live` y devuelve el foco al inicio del contenido.
 */
export function RouteAnnouncer() {
  const { pathname } = useLocation()
  const [mensaje, setMensaje] = useState('')
  const esPrimeraCarga = useRef(true)

  useEffect(() => {
    // En la carga inicial el anuncio sobra: el lector ya está leyendo la página.
    if (esPrimeraCarga.current) {
      esPrimeraCarga.current = false
      return
    }

    const module = findModuleByPath(pathname)
    setMensaje(
      module ? `${module.label}. Módulo cargado.` : 'Página no encontrada.',
    )

    const contenido = document.getElementById('contenido')
    contenido?.focus({ preventScroll: true })
  }, [pathname])

  return (
    <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {mensaje}
    </div>
  )
}

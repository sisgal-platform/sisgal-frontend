import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderApp } from '../test/render'

/** Enlaces del menú marcados como página actual. */
function enlacesActivos() {
  return screen
    .getAllByRole('link')
    .filter((enlace) => enlace.getAttribute('aria-current') === 'page')
}

describe('Indicación del módulo activo', () => {
  it('marca el dashboard como activo en la raíz', () => {
    renderApp({ ruta: '/' })

    expect(enlacesActivos().map((e) => e.textContent)).toEqual(['Dashboard'])
  })

  it('marca únicamente el módulo de la ruta actual', () => {
    renderApp({ ruta: '/nomina' })

    const activos = enlacesActivos()
    expect(activos).toHaveLength(1)
    expect(activos[0]).toHaveTextContent('Nómina')
  })

  it('mueve la marca al navegar', async () => {
    const { user } = renderApp({ ruta: '/nomina' })

    await user.click(screen.getByRole('link', { name: 'Nómina' }))
    await screen.findByRole('heading', { level: 1, name: 'Nómina' })

    const activos = enlacesActivos()
    expect(activos).toHaveLength(1)
    expect(activos[0]).toHaveTextContent('Nómina')
  })

  it('no deja el dashboard activo dentro de otro módulo', () => {
    renderApp({ ruta: '/personal' })

    expect(screen.getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute(
      'aria-current',
    )
  })

  it('refuerza el estado activo con una clase, no solo con color', () => {
    renderApp({ ruta: '/asistencia' })

    expect(screen.getByRole('link', { name: 'Asistencia' })).toHaveClass('is-active')
  })

  it('no marca ningún módulo en una ruta desconocida', () => {
    renderApp({ ruta: '/no-existe' })

    expect(enlacesActivos()).toHaveLength(0)
  })
})

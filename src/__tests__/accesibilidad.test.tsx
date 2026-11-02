import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderApp } from '../test/render'

describe('Accesibilidad de la navegación', () => {
  it('ofrece un enlace para saltar al contenido', () => {
    renderApp()

    const salto = screen.getByRole('link', { name: 'Saltar al contenido' })
    expect(salto).toHaveAttribute('href', '#contenido')
    expect(document.getElementById('contenido')).not.toBeNull()
  })

  it('expone el menú y el contenido como landmarks con nombre', () => {
    renderApp()

    expect(screen.getByRole('navigation', { name: 'Módulos del sistema' })).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('mueve el foco al contenido tras navegar', async () => {
    const { user } = renderApp()

    await user.click(screen.getByRole('link', { name: 'Asistencia' }))

    await waitFor(() => {
      expect(document.activeElement).toBe(document.getElementById('contenido'))
    })
  })

  it('anuncia el módulo cargado en una región live', async () => {
    const { user } = renderApp()

    const region = screen.getByRole('status')
    expect(region).toHaveAttribute('aria-live', 'polite')
    // En la carga inicial no se anuncia nada: el lector ya lee la página.
    expect(region).toHaveTextContent('')

    await user.click(screen.getByRole('link', { name: 'Nómina' }))

    await waitFor(() => {
      expect(region).toHaveTextContent('Nómina. Módulo cargado.')
    })
  })

  it('permite navegar con el teclado', async () => {
    const { user, router } = renderApp()

    screen.getByRole('link', { name: 'Nómina' }).focus()
    await user.keyboard('{Enter}')

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/nomina')
    })
  })

  it('describe el estado del botón de menú en viewport angosto', async () => {
    const { user } = renderApp()

    const toggle = screen.getByRole('button', { name: 'Abrir menú' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).toHaveAttribute('aria-controls', 'menu-lateral')

    await user.click(toggle)

    expect(screen.getByRole('button', { name: 'Cerrar menú' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
  })
})

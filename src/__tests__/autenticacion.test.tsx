import { screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { login, signup } from '../auth/api'
import type { AuthResponseDto, AuthTokens } from '../auth/types'
import { EMPTY_SESSION } from '../session/types'
import { renderApp } from '../test/render'

vi.mock('../auth/api', () => ({
  login: vi.fn(),
  signup: vi.fn(),
  refresh: vi.fn(),
  logout: vi.fn(),
}))

const USUARIO_ADMIN: AuthResponseDto = {
  user: {
    id: 'u-1',
    fullName: 'María González',
    email: 'maria@example.com',
    emailConfirmed: true,
    role: 'ADMINISTRADOR',
  },
  tokens: {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    expiresAt: Math.floor(Date.now() / 1000) + 3600,
    tokenType: 'bearer',
  },
}

const TOKENS_FUTUROS: AuthTokens = {
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
  expiresAt: Math.floor(Date.now() / 1000) + 3600,
  tokenType: 'bearer',
}

afterEach(() => {
  vi.clearAllMocks()
  window.localStorage.clear()
})

describe('Autenticación', () => {
  it('inicia sesión con credenciales válidas y accede al dashboard', async () => {
    vi.mocked(login).mockResolvedValue(USUARIO_ADMIN)
    const { user } = renderApp({ ruta: '/login', sesion: EMPTY_SESSION })

    await user.type(screen.getByLabelText('Correo electrónico'), 'maria@example.com')
    await user.type(screen.getByLabelText('Contraseña'), 'secret123')
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))

    expect(
      await screen.findByRole('heading', { level: 1, name: /panel administrativo/i }),
    ).toBeInTheDocument()
    expect(await screen.findByTestId('toast')).toHaveTextContent(
      'Inicio de sesión exitoso.',
    )
  })

  it('muestra un mensaje genérico ante credenciales inválidas (401)', async () => {
    vi.mocked(login).mockRejectedValue({
      statusCode: 401,
      message: 'Invalid credentials',
      error: 'Unauthorized',
    })
    const { user } = renderApp({ ruta: '/login', sesion: EMPTY_SESSION })

    await user.type(screen.getByLabelText('Correo electrónico'), 'maria@example.com')
    await user.type(screen.getByLabelText('Contraseña'), 'incorrecta1')
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))

    expect(await screen.findByTestId('toast')).toHaveTextContent(
      'Credenciales incorrectas.',
    )
  })

  it('informa el bloqueo temporal de la cuenta (423)', async () => {
    vi.mocked(login).mockRejectedValue({
      statusCode: 423,
      message: 'Too many failed attempts. Try again later.',
    })
    const { user } = renderApp({ ruta: '/login', sesion: EMPTY_SESSION })

    await user.type(screen.getByLabelText('Correo electrónico'), 'maria@example.com')
    await user.type(screen.getByLabelText('Contraseña'), 'secret123')
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))

    expect(await screen.findByTestId('toast')).toHaveTextContent(
      'Cuenta bloqueada temporalmente.',
    )
  })

  it('notifica cuando faltan campos obligatorios', async () => {
    const { user } = renderApp({ ruta: '/login', sesion: EMPTY_SESSION })

    await user.click(screen.getByRole('button', { name: 'Ingresar' }))

    expect(await screen.findByTestId('toast')).toHaveTextContent(
      'Completa todos los campos.',
    )
  })

  it('redirige a login cuando no hay sesión (ruta protegida)', async () => {
    renderApp({ ruta: '/', sesion: EMPTY_SESSION })

    expect(
      await screen.findByRole('heading', { level: 1, name: /iniciar sesión/i }),
    ).toBeInTheDocument()
  })

  it('permite a un administrador acceder al signup', async () => {
    renderApp({ ruta: '/signup' })

    expect(
      await screen.findByRole('heading', { level: 1, name: /crear administrador/i }),
    ).toBeInTheDocument()
  })

  it('impide el signup a un rol no administrador', async () => {
    renderApp({
      ruta: '/signup',
      sesion: {
        user: { id: 'u-2', nombre: 'Laura Gómez', rol: 'supervisor' },
        lastModule: null,
        startedAt: '2026-01-02T08:00:00.000Z',
      },
    })

    expect(
      await screen.findByRole('heading', { level: 1, name: /dashboard/i }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: /crear administrador/i }),
    ).not.toBeInTheDocument()
  })

  it('crea un administrador y muestra la confirmación', async () => {
    window.localStorage.setItem('sisgal.tokens', JSON.stringify(TOKENS_FUTUROS))
    vi.mocked(signup).mockResolvedValue(USUARIO_ADMIN)
    const { user } = renderApp({ ruta: '/signup' })

    await user.type(screen.getByLabelText('Nombre completo'), 'Carlos Rodríguez')
    await user.type(screen.getByLabelText('Correo electrónico'), 'carlos@example.com')
    await user.type(screen.getByLabelText('Contraseña'), 'clave123')
    await user.click(screen.getByRole('button', { name: 'Crear' }))

    expect(
      await screen.findByRole('heading', { level: 1, name: /administrador creado/i }),
    ).toBeInTheDocument()
  })
})

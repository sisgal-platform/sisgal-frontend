import { screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { AuthResponseDto, AuthTokens } from '../auth/types'
import { EMPTY_SESSION } from '../session/types'
import { renderApp } from '../test/render'

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

function jsonResponse(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }
}

function stubFetch(status: number, body: unknown) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(status, body)))
}

afterEach(() => {
  vi.unstubAllGlobals()
  window.localStorage.clear()
})

describe('Autenticación', () => {
  it('inicia sesión con credenciales válidas y accede al dashboard', async () => {
    stubFetch(200, USUARIO_ADMIN)
    const { user } = renderApp({ ruta: '/login', sesion: EMPTY_SESSION })

    await user.type(screen.getByLabelText('Correo electrónico'), 'maria@example.com')
    await user.type(screen.getByLabelText('Contraseña'), 'secret123')
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))

    expect(
      await screen.findByRole('heading', { level: 1, name: /panel administrativo/i }),
    ).toBeInTheDocument()
  })

  it('muestra un mensaje genérico ante credenciales inválidas (401)', async () => {
    stubFetch(401, {
      statusCode: 401,
      message: 'Invalid credentials',
      error: 'Unauthorized',
    })
    const { user } = renderApp({ ruta: '/login', sesion: EMPTY_SESSION })

    await user.type(screen.getByLabelText('Correo electrónico'), 'maria@example.com')
    await user.type(screen.getByLabelText('Contraseña'), 'incorrecta1')
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Credenciales incorrectas.',
    )
  })

  it('informa el bloqueo temporal de la cuenta (423)', async () => {
    stubFetch(423, {
      statusCode: 423,
      message: 'Too many failed attempts. Try again later.',
    })
    const { user } = renderApp({ ruta: '/login', sesion: EMPTY_SESSION })

    await user.type(screen.getByLabelText('Correo electrónico'), 'maria@example.com')
    await user.type(screen.getByLabelText('Contraseña'), 'secret123')
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Cuenta bloqueada temporalmente.',
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
    stubFetch(201, USUARIO_ADMIN)
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

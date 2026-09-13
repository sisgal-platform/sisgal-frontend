import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { login as loginApi } from '../auth/api'
import { mapUserDtoToSessionUser } from '../auth/mapUser'
import { writeTokens } from '../auth/tokenStorage'
import type { ApiError } from '../auth/types'
import { useSession } from '../session/useSession'

function mensajeDeError(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'statusCode' in error) {
    switch ((error as ApiError).statusCode) {
      case 401:
        return 'Credenciales incorrectas.'
      case 423:
        return 'Cuenta bloqueada temporalmente. Intenta de nuevo más tarde.'
      case 429:
        return 'Demasiados intentos. Espera un momento e inténtalo de nuevo.'
      case 400:
        return 'Revisa el correo y la contraseña e inténtalo de nuevo.'
      default:
        return 'Ocurrió un error. Inténtalo de nuevo.'
    }
  }
  return 'No se pudo conectar con el servidor.'
}

export function LoginPage() {
  const { login } = useSession()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setEnviando(true)
    try {
      const { user, tokens } = await loginApi({ email, password })
      writeTokens(tokens)
      login(mapUserDtoToSessionUser(user))
      const from = (location.state as { from?: { pathname?: string } } | null)
        ?.from?.pathname
      navigate(from ?? '/', { replace: true })
    } catch (err) {
      setError(mensajeDeError(err))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-secondary px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-surface p-6 shadow-sm sm:p-8">
        <h1 className="mb-6 text-2xl font-bold text-primary">Iniciar sesión</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm text-text-muted">
            Correo electrónico
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
              className="rounded-lg border border-gray-300 px-3 py-2 text-text"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-text-muted">
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
              autoComplete="current-password"
              className="rounded-lg border border-gray-300 px-3 py-2 text-text"
            />
          </label>
          {error && (
            <p role="alert" className="rounded-lg bg-error-light px-3 py-2 text-sm text-error">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={enviando}
            className="rounded-lg bg-primary px-4 py-2 font-semibold text-white transition-colors hover:bg-primary-light disabled:opacity-60"
          >
            {enviando ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>
      </div>
    </main>
  )
}
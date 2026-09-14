import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { signup as signupApi } from '../auth/api'
import { getValidAccessToken } from '../auth/tokenStorage'
import type { ApiError } from '../auth/types'
import { useToast } from '../toast/useToast'

function mensajeDeError(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'statusCode' in error) {
    switch ((error as ApiError).statusCode) {
      case 409:
        return 'Ese correo ya está registrado.'
      case 401:
        return 'Tu sesión expiró. Vuelve a iniciar sesión.'
      case 403:
        return 'No tienes permisos para crear administradores.'
      case 400:
        return 'Datos inválidos. La contraseña debe tener al menos 8 caracteres e incluir letras y números.'
      default:
        return 'Ocurrió un error. Inténtalo de nuevo.'
    }
  }
  return 'No se pudo conectar con el servidor.'
}

export function SignupPage() {
  const { showToast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [exito, setExito] = useState(false)
  const [enviando, setEnviando] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!email.trim() || !password) {
      showToast('Completa los campos obligatorios.', 'warning')
      return
    }

    setEnviando(true)
    try {
      const accessToken = await getValidAccessToken()
      await signupApi({ email, password, fullName }, accessToken)
      setExito(true)
    } catch (err) {
      showToast(mensajeDeError(err), 'error')
    } finally {
      setEnviando(false)
    }
  }

  if (exito) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-secondary px-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-surface p-6 shadow-sm sm:p-8">
          <h1 className="mb-4 text-2xl font-bold text-primary">Administrador creado</h1>
          <p className="mb-6 text-text">El nuevo administrador ya puede iniciar sesión.</p>
          <Link to="/" className="font-semibold text-primary hover:text-primary-light">
            Volver al dashboard
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-secondary px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-surface p-6 shadow-sm sm:p-8">
        <h1 className="mb-6 text-2xl font-bold text-primary">Crear administrador</h1>
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm text-text-muted">
            Nombre completo
            <input
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-text"
            />
          </label>
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
              autoComplete="new-password"
              className="rounded-lg border border-gray-300 px-3 py-2 text-text"
            />
          </label>
          <button
            type="submit"
            disabled={enviando}
            className="rounded-lg bg-primary px-4 py-2 font-semibold text-white transition-colors hover:bg-primary-light disabled:opacity-60"
          >
            {enviando ? 'Creando…' : 'Crear'}
          </button>
          <Link to="/" className="text-sm font-semibold text-primary hover:text-primary-light">
            Volver al dashboard
          </Link>
        </form>
      </div>
    </main>
  )
}
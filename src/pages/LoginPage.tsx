import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router'
import type { AuthError } from '@supabase/supabase-js'
import { signInWithPassword } from '../auth/auth'
import { mapSupabaseUser } from '../auth/mapUser'
import { useSession } from '../session/useSession'
import { useToast } from '../toast/useToast'

function mensajeDeError(error: AuthError | null): string {
  if (!error) return 'Ocurrió un error. Inténtalo de nuevo.'
  if (error.status === 429 || /rate limit/i.test(error.message)) {
    return 'Demasiados intentos. Espera un momento e inténtalo de nuevo.'
  }
  return 'Credenciales incorrectas.'
}

export function LoginPage() {
  const { login } = useSession()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!email.trim() || !password) {
      showToast('Completa todos los campos.', 'warning')
      return
    }

    setEnviando(true)
    try {
      const { user, error } = await signInWithPassword(email, password)
      if (error || !user) {
        showToast(mensajeDeError(error), 'error')
        return
      }

      login(mapSupabaseUser(user))
      showToast('Inicio de sesión exitoso.', 'success')
      const from = (location.state as { from?: { pathname?: string } } | null)
        ?.from?.pathname
      navigate(from ?? '/', { replace: true })
    } catch {
      showToast('Ocurrió un error. Inténtalo de nuevo.', 'error')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-secondary px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-surface p-6 shadow-sm sm:p-8">
        <h1 className="mb-6 text-2xl font-bold text-primary">Iniciar sesión</h1>
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
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

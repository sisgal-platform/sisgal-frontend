# devplan.md — Frontend SISGAL

Plan de desarrollo del frontend (React + TypeScript + Vite) del sistema SISGAL.

## Stack

| Componente | Tecnología |
|---|---|
| UI | React 19 + TypeScript |
| Build | Vite |
| Routing | react-router v7 (data router) |
| Estilos | Tailwind CSS (tema en `tailwind.config.js`) |
| Auth | Supabase (`@supabase/supabase-js`) |
| Pruebas | Vitest + Testing Library |

## Módulo de autenticación

Alcance: login, logout, guard de rutas y sincronización de sesión, directo contra
Supabase (sin backend intermedio).

### Estructura

```
src/
  auth/
    auth.ts           Wrappers de supabase.auth (signInWithPassword, signOut)
    mapUser.ts        User de Supabase -> SessionUser (nombre y rol)
    AuthSync.tsx      Rehidrata sesión (getSession) y escucha onAuthStateChange
    RequireAuth.tsx   Guard de sesión (redirige a /login)
  supabase/
    client.ts         Cliente Supabase (createClient, lazy)
  toast/
    ToastProvider.tsx Notificaciones flotantes (useToast) con auto-cierre
  pages/
    LoginPage.tsx     Formulario de inicio de sesión
  session/            Estado de sesión persistido en sessionStorage
```

### Decisiones

- **Auth directa con Supabase**: `signInWithPassword`, `signOut`, `getSession` y
  `onAuthStateChange` (quickstart de Supabase). Se eliminó el backend intermedio.
- **Sesión en `sessionStorage`** (`sisgal.session`): se mantiene el comportamiento
  del `SessionProvider` para conservar el usuario y el último módulo visitado.
- **Rol**: se lee de `app_metadata.role` (`ADMINISTRADOR` → `administrador`);
  el nombre se lee de `user_metadata` (full_name / fullName / name).
- **Protección de rutas**: `/login` es pública; el shell queda bajo `RequireAuth`.
- **Notificaciones flotantes**: sistema propio (`ToastProvider` + `useToast`). Los
  errores de login (credenciales inválidas, rate limit, campos vacíos) se muestran
  como toast; el login exitoso muestra un toast de éxito.

## Pruebas

```
src/__tests__/
  autenticacion.test.tsx  login (éxito + errores/toasts), campos vacíos y guard
```

El wrapper `src/auth/auth.ts` se mockea con `vi.mock('../auth/auth', ...)`.

## Verificación

```bash
npm run build   # tsc -b + vite build
npm run lint    # eslint
npm test        # vitest
```

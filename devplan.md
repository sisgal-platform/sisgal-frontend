# devplan.md — Frontend SISGAL

Plan de desarrollo del frontend (React + TypeScript + Vite) del sistema SISGAL.

## Stack

| Componente | Tecnología |
|---|---|
| UI | React 19 + TypeScript |
| Build | Vite |
| Routing | react-router v7 (data router) |
| Estilos | Tailwind CSS (tema en `tailwind.config.js`) |
| HTTP | `fetch` nativo (sin axios) |
| Pruebas | Vitest + Testing Library |

## Módulo de autenticación (completado)

Alcance: login, signup de administrador, logout, guard de rutas y refresco de token,
alineado al contrato definido en `sisgal-core-service/BACKEND_CONTEXT.md`.

### Estructura

```
src/
  auth/
    types.ts          Tipos del contrato del backend (union types, sin enum)
    api.ts            Cliente HTTP (login/signup/refresh/logout)
    tokenStorage.ts   Persistencia de tokens en localStorage + refresco automático
    mapUser.ts        UserDto -> SessionUser (mapeo de nombres)
    RequireAuth.tsx   Guard de sesión (redirige a /login)
    RequireAdmin.tsx  Guard de rol (solo administrador)
  config/
    env.ts            Lee VITE_API_BASE_URL (default http://localhost:3000)
  pages/
    LoginPage.tsx     Formulario de inicio de sesión
    SignupPage.tsx    Creación de administrador (solo admin)
  session/            Estado de sesión (pre-existente, sin cambios de shape)
```

### Decisiones

- **Tokens en `localStorage`** (`sisgal.tokens`): sobreviven a recarga y cierre del
  navegador; el refresco se hace cuando quedan menos de 60 s de validez.
- **Sesión en `sessionStorage`** (`sisgal.session`): se mantiene el comportamiento
  pre-existente del `SessionProvider`.
- **Manejo de errores por `statusCode`**: 401 credenciales inválidas (mensaje genérico),
  423 cuenta bloqueada, 429 rate limit, 400 validación, 409 email duplicado (signup).
- **Protección de rutas**: `/login` es pública; todo lo demás queda bajo `RequireAuth`;
  `/signup` además bajo `RequireAdmin`.

## Deuda técnica / alineación con backend

El backend expone `UserDto.fullName` y `UserDto.role` (valor `'ADMINISTRADOR'`), mientras
que la sesión interna del frontend usa `nombre` y `rol` (valores en minúscula). Por ahora
`mapUser.ts` traduce `fullName → nombre` y `ADMINISTRADOR → administrador`.

**Pendiente**: alinear el backend para eliminar el mapeo, eligiendo una de estas opciones:

1. Renombrar en el backend `fullName → nombre` y el valor de rol a `'administrador'`.
2. Migrar el frontend a usar `fullName`/`role` tal cual el backend.

## Pruebas

```
src/__tests__/
  autenticacion.test.tsx  login (éxito + errores 401/423), guards y signup
```

El cliente HTTP se prueba mockeando `fetch` con `vi.stubGlobal('fetch', ...)`.

## Verificación

```bash
npm run build   # tsc -b + vite build
npm run lint    # eslint
npm test        # vitest
```

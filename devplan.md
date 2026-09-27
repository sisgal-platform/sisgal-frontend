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

## Parametrización de cargos (HU41)

Alcance: catálogo de cargos (consultar, registrar, actualizar y desactivar)
contra el recurso `/cargos` del sisgal-core-service.

### Estructura

```
src/
  api/
    http.ts             Cliente HTTP: Bearer con el token de Supabase y
                        errores del backend normalizados a ApiError
  cargos/
    types.ts            Cargo (PositionResponseDto) y CargoInput
    cargosApi.ts        Endpoints de /cargos
    useCargos.ts        Estado del listado y operaciones (recarga tras cada cambio)
    CargoFormDialog.tsx Formulario de registro/actualización con validación
  components/
    Modal.tsx           Diálogo accesible (foco, Escape, clic fuera)
    ConfirmDialog.tsx   Confirmación de operaciones destructivas
  pages/
    ConfiguracionPage.tsx  Índice de catálogos parametrizables
    CargosPage.tsx         /configuracion/cargos (solo administrador)
```

### Decisiones

- **Desactivación lógica**: `DELETE /cargos/:id` marca el cargo como inactivo;
  el backend responde 409 si tiene empleados asociados y el mensaje se muestra
  como toast de error.
- **Nombre duplicado**: el 409 al registrar/actualizar se muestra junto al campo.
- **Validación en cliente** con las mismas reglas de `CrearCargoDto` (obligatorio,
  2–100 caracteres); el backend sigue siendo la fuente de verdad.
- **Catálogo para formularios** (CA06): `cargosApi.listarActivos()`.

## Pruebas

```
src/__tests__/
  autenticacion.test.tsx  login (éxito + errores/toasts), campos vacíos y guard
  cargos.test.tsx         HU41: CA01–CA08 sobre la pantalla de cargos
  cargosApi.test.ts       URLs y métodos del recurso /cargos
  http.test.ts            token Bearer y normalización de errores del backend
```

El wrapper `src/auth/auth.ts` se mockea con `vi.mock('../auth/auth', ...)`.

## Verificación

```bash
npm run build   # tsc -b + vite build
npm run lint    # eslint
npm test        # vitest
```

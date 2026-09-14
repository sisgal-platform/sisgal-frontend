# sisgal-frontend

Interfaz administrativa de SISGAL (Attendance & Payroll System), construida con
React 19, TypeScript y Vite.

## Puesta en marcha

```bash
npm install
npm run dev
```

| Script | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo con HMR. |
| `npm run build` | Chequeo de tipos (`tsc -b`) y build de producción. |
| `npm run lint` | ESLint sobre todo el proyecto. |
| `npm test` | Pruebas con Vitest. |
| `npm run test:watch` | Pruebas en modo watch. |

## Navegación entre módulos

El shell administrativo es una SPA: `AppLayout` se monta una sola vez y el cambio
de ruta reemplaza únicamente el `<Outlet />`, de modo que navegar nunca recarga
la aplicación ni pierde el estado de sesión.

```
src/
  modules/catalog.ts    Catálogo de módulos: menú y rutas salen de aquí
  routes.tsx            Rutas derivadas del catálogo + rutas de auth
  auth/                 Autenticación: tipos, cliente HTTP, tokens y guards
  config/env.ts         Base URL del backend (VITE_API_BASE_URL)
  toast/                Notificaciones flotantes (useToast / ToastProvider)
  components/
    AppLayout.tsx       Barra superior, menú lateral y área de contenido
    NavMenu.tsx         Menú principal (aria-current en el módulo activo)
    RouteAnnouncer.tsx  Anuncio y foco al cambiar de ruta
  session/              Estado de sesión persistido en sessionStorage
  pages/                Marco de cada módulo + LoginPage y SignupPage
```

### Agregar un módulo

Basta con añadir una entrada a `MODULES` en `src/modules/catalog.ts`. El menú y
el enrutador se derivan del mismo arreglo, así que no pueden desincronizarse.

### Autenticación y sesión

La autenticación se delega en el backend NestJS (`/auth/*`), que a su vez usa
Supabase como fuente de verdad. El flujo es:

1. `LoginPage` llama a `POST /auth/login` y guarda `user` + `tokens`.
2. Los tokens viven en `localStorage` (`sisgal.tokens`) y la sesión de usuario
   en `sessionStorage` (`sisgal.session`), por lo que ambas sobreviven a una
   recarga.
3. Antes de un endpoint autenticado (solo `signup`), `getValidAccessToken()`
   refresca el `accessToken` si está por expirar.
4. `RequireAuth` redirige a `/login` cuando no hay sesión; `RequireAdmin` limita
   `/signup` al rol administrador. El logout limpia tokens y sesión.

Las rutas protegidas son las del shell (`AppLayout`) y `/signup`; `/login` es
pública. El contrato completo está en `sisgal-core-service/BACKEND_CONTEXT.md`.

El cliente HTTP vive en `src/auth/api.ts` y usa `axios` contra la base URL de
`VITE_API_BASE_URL`; los errores del servidor se propagan como `ApiError`
(`statusCode` + `message`) para que las vistas decidan por código de estado.

Los errores de login/signup (credenciales inválidas, cuenta bloqueada, campos
vacíos, etc.) se muestran de dos formas: junto al formulario (`role="alert"`) y
como notificación flotante vía `useToast()`.

### Accesibilidad

- Enlace "Saltar al contenido" como primer elemento enfocable.
- Landmarks `banner`, `navigation` (con nombre) y `main`.
- El módulo activo se marca con `aria-current="page"`, más peso tipográfico y una
  barra lateral: no depende solo del color.
- Al navegar, el foco pasa al contenido y una región `aria-live` anuncia el
  módulo cargado, que es lo que el navegador no hace por sí solo en una SPA.
- El botón del menú en viewport angosto expone `aria-expanded` y `aria-controls`.

## Pruebas

Vitest con Testing Library sobre jsdom. Las pruebas montan la app completa
(rutas reales y sesión) sobre un router en memoria, así que ejercitan la
navegación tal como ocurre en el navegador.

```
src/__tests__/
  navegacion  → rutas, historial, URL directa, 404, ausencia de recarga
  modulo-activo → indicación del módulo actual
  sesion      → persistencia, rehidratación y cierre de sesión
  accesibilidad → foco, anuncios, landmarks y teclado
  autenticacion → login (éxito + errores), guards y signup
```

## Notas de configuración

- La URL del backend se configura con `VITE_API_BASE_URL` (default
  `http://localhost:3000`) en un archivo `.env` en la raíz. Ver
  `src/config/env.ts`.

Para endurecer el linter con reglas que requieren tipos, ver la
[guía de configuración type-aware de typescript-eslint](https://typescript-eslint.io/getting-started/typed-linting/).

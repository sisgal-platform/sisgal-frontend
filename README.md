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
  auth/                 Autenticación con Supabase (login, guards, sesión)
  supabase/client.ts    Cliente de Supabase (createClient)
  toast/                Notificaciones flotantes (useToast / ToastProvider)
  components/
    AppLayout.tsx       Barra superior, menú lateral y área de contenido
    NavMenu.tsx         Menú principal (aria-current en el módulo activo)
    RouteAnnouncer.tsx  Anuncio y foco al cambiar de ruta
  session/              Estado de sesión persistido en sessionStorage
  pages/                Marco de cada módulo + LoginPage
```

### Agregar un módulo

Basta con añadir una entrada a `MODULES` en `src/modules/catalog.ts`. El menú y
el enrutador se derivan del mismo arreglo, así que no pueden desincronizarse.

### Autenticación y sesión

La autenticación se hace directo contra Supabase (`@supabase/supabase-js`), sin
backend intermedio. El flujo es:

1. `LoginPage` llama a `supabase.auth.signInWithPassword`.
2. Al autenticarse, se mapea el `User` de Supabase a la sesión interna (`nombre`
   desde `user_metadata`, `rol` desde `app_metadata.role`).
3. `AuthSync` rehidrata la sesión al arrancar (`getSession`) y se suscribe a
   `onAuthStateChange` para sincronizar login, logout y refresco de token.
4. `RequireAuth` redirige a `/login` cuando no hay sesión; el logout llama a
   `supabase.auth.signOut()`.

Las rutas protegidas son las del shell (`AppLayout`); `/login` es pública.

Los errores de login (credenciales inválidas, rate limit, campos vacíos) se
muestran como notificación flotante vía `useToast()`.

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
  autenticacion → login (éxito + errores), toast y guard
```

## Notas de configuración

- La conexión a Supabase se configura con `VITE_SUPABASE_URL` y
  `VITE_SUPABASE_ANON_KEY` en un archivo `.env` en la raíz. Ver
  `src/supabase/client.ts`.
- La URL del backend (sisgal-core-service) se configura con `VITE_API_URL`.
  Ver `src/lib/axios.ts`.

Para endurecer el linter con reglas que requieren tipos, ver la
[guía de configuración type-aware de typescript-eslint](https://typescript-eslint.io/getting-started/typed-linting/).

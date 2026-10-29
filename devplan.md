# devplan.md — Frontend SISGAL

Plan de desarrollo del frontend (React + TypeScript + Vite) del sistema
SISGAL. Repo separado del backend (`sisgal-core-service`, ver su propio
`dev_plan.md`).

## Stack

| Componente | Tecnología |
|---|---|
| UI | React 19 + TypeScript |
| Build | Vite |
| Routing | react-router v7 (data router) |
| Estilos | Tailwind CSS v3 (tema en `tailwind.config.js`) |
| Componentes base | Radix UI (`Dialog`, `AlertDialog`, `Tabs`) envueltos en `src/components/ui/` |
| HTTP | Axios (`src/lib/axios.ts`), errores normalizados con `src/lib/apiError.ts` (`toApiError` → `ApiError`) |
| Auth | Supabase (`@supabase/supabase-js`), sesión en `sessionStorage` |
| Pruebas | Vitest + Testing Library |
| Gráficos | Recharts (`v3.10.1`, desde HU35 — primera y única librería de gráficos del proyecto) |

## Estructura real de carpetas (la de abajo está desactualizada, usar esta)

```
src/
  features/<dominio>/       # un feature por dominio de negocio
    components/
    hooks/
    services/
    interfaces/types.ts     # espejo exacto de los DTOs del backend
    index.tsx                # componente principal del feature, exportado como <Dominio>Feature
  pages/<dominio>/<Dominio>Page.tsx   # wrapper fino: RequireRole + <DominioFeature />
  routes/
    app.routes.tsx           # árbol de rutas (react-router)
    guards/RequireAuth.tsx   # sesión válida
    guards/RequireRole.tsx   # rol específico (ej. administrador)
  config/modules.catalog.ts  # fuente única de verdad del menú lateral y las rutas
  components/
    ui/        # primitivos (Dialog, AlertDialog, Tabs, Button) — construidos por el equipo sobre Radix
    atoms/     # ej. SectionHeader
    molecules/ # ej. FloatingInput, FloatingSelect (etiqueta flotante)
  lib/         # axios.ts, apiError.ts, formatters.ts
  session/     # estado de sesión persistido
  toast/       # ToastProvider + useToast (notificaciones flotantes)
```

Features existentes: `empleados`, `sucursales`, `cargos`, `prestamos`,
`incapacidades`, `novedades` (placeholder genérico, ver nota abajo),
`configuracion`, `dashboard`, `auth`.

## Convenciones ya establecidas (verificadas por historial de git, no asumidas)

- **Nombres de código en inglés**, sin excepción, incluso en variables de UI
  internas de componentes/hooks nuevos (`loading`, `reload`, `submitting`,
  tipos como `DisabilityType`/`DisabilityStatus`). Los `features` viejos
  (`empleados`) tienen variables en español (`cargando`, `recargar`,
  `onReintentar`) porque se escribieron antes de que esta convención quedara
  firme — **no se retrocede a corregirlos** salvo que se esté tocando ese
  archivo por otra razón. Todo lo nuevo va en inglés.
- **Comentarios cortos en español**, solo donde la lógica no se explica sola
  (igual que el backend).
- **Tipos espejo del backend**: cada `interfaces/types.ts` de un feature
  replica exactamente los DTOs del backend (`RegisterXDto` →
  `RegisterXPayload`, `XResponseDto` → tipo `X`, `ListXQueryDto` → tipo
  `XQuery`). Nunca se derivan con `Omit<>` de otro tipo si los nombres de
  campo no coinciden 1:1 (bug real que pasó: `RegisterEmployeePayload`
  derivado de `Employee` mandaba `document` en vez de `documentNumber`).
- **Servicios**: objeto plano `xService = { async metodo(...) {...} }`, usa
  `apiClient` (axios) + `try/catch` con `throw toApiError(error)`. Nombres de
  método en inglés (`register`, `findAll`, `getIndicators`), espejo del
  método/endpoint del backend.
- **Hooks de listado**: patrón `useX(filters)` → `{ items, loading, error,
  reload }`, con `version` interno (`useState`) que se incrementa para
  forzar recarga, y una bandera `cancelled` en el `useEffect` para no
  actualizar estado si el componente se desmontó antes de que la petición
  terminara.
- **Hooks de indicadores** (agregados tipo conteo/suma): variante con
  `.then(onSuccess, onError)` en vez de `try/catch`, y un `version` guardado
  junto al resultado para saber si la respuesta en curso sigue siendo
  vigente (`isCurrent = result?.version === version`) — copiado del patrón
  de Tatiana en `usePrestamosIndicadores`.
- **Formularios**: estado `values`/`errors` con `useState`, validación pura
  en una función aparte **dentro del mismo archivo del componente** (no en
  una carpeta `validation/` separada — se intentó eso en `empleados` y en un
  primer intento de `incapacidades`, y se revirtió explícitamente porque no
  es el patrón de Tatiana: ella define la función de validación como una
  `const` suelta arriba del componente, en el mismo archivo, ej.
  `getValidationError` en `CreateSucursalDialog.tsx`). Validación por campo
  en `onBlur` + validación completa en `onSubmit`.
- **Formularios con modo solo lectura**: un prop `soloLectura`/`readOnly` que
  deshabilita todos los campos y oculta o cambia el botón de envío — patrón
  usado en el detalle de empleado (HU40) reutilizando el mismo formulario de
  registro/edición.
- **Filtros de listado**: `<input type="date">` nativo, **no** un calendario
  de rango con librería nueva (`react-day-picker`/Popover) — se evaluó y se
  descartó para seguir el precedente más reciente del equipo (`prestamos`,
  HU41), que resolvió fechas con dos inputs nativos sin dependencias nuevas.
  Si el filtro de fecha tiene una regla de validación explícita (ej. "no
  permitir fecha inicial posterior a la final, con mensaje de error"), se
  implementa esa validación explícita — no se asume el comportamiento de
  "auto-intercambiar" que sí usa `prestamos` si la HU no lo pide así.
- **Paginación**: client-side (`.slice()` sobre el arreglo ya cargado), 10
  elementos por página, con reset a página 1 cuando cambian los filtros
  aplicados. Decisión explícita del equipo para no complicar el backend con
  paginación real mientras el volumen de datos sea bajo.
- **Padding de página**: el layout global (`AppLayout`, clase `.contenido`)
  tiene `padding: 0` en desktop — cada feature que es ruta de **primer
  nivel** (no vive dentro de un `Tabs`) necesita `p-4` en su `<section>`
  raíz, si no el contenido queda pegado al borde del viewport. Los features
  que sí viven dentro de un `Tabs` (ej. `sucursales`/`cargos` dentro de
  `configuracion`) no llevan ese `p-4` propio — lo aporta el `TabsContent`
  padre.
- **Reutilización cross-feature**: importar servicios/hooks de otro feature
  directo (ej. `incapacidades` importa `employeesService` y
  `useActivePositions` de `empleados`) es un patrón aceptado y ya usado por
  el equipo (`empleados` también importa `cargosService` de `cargos`). Los
  **componentes de UI puramente presentacionales** (ej. una card de
  indicador) se copian/recrean dentro del propio feature en vez de
  importarlos de otro — para no acoplar un feature a la carpeta de otro por
  algo tan chico.

## Navegación / catálogo de módulos

`src/config/modules.catalog.ts` es la fuente única de verdad del menú lateral
y las rutas (`MODULES` + `findModuleByPath`). Cada módulo implementado tiene
su propia entrada de **primer nivel** (`path`, `label`, `icon`,
`adminOnly?`) — aunque conceptualmente algunos quedaban bajo el paraguas
"Novedades" (`descripción: "Préstamos, incapacidades y adelantos"`), en la
práctica cada uno rompió como ítem propio del sidebar cuando se implementó
(`prestamos` lo hizo primero, `incapacidades` siguió el mismo patrón). El
módulo `novedades` en sí sigue siendo un placeholder genérico
(`ModulePage`, "próximamente") sin uso real — **no mover nada ahí sin que el
equipo lo decida explícitamente**, ya se intentó una vez (anidar
`incapacidades` en un `Tabs` dentro de `novedades`) y se revirtió.

## Features — estado por historia de usuario

Este documento no se había actualizado desde hacía varias historias — si
algo de lo que sigue no coincide con `develop`, confiar en
`git log --oneline --merges develop` (trae los números de PR), no en este
archivo.

### Auth (login, guards, sesión) — ✅ Completo

`src/routes/guards/{RequireAuth,RequireRole}.tsx`, `src/session/`,
`src/auth/` o similar (ver estructura real, no la de abajo que está vieja).

### HU21 "Registrar empleados" — ✅ Completa

### HU39 "Consulta de información de empleados" — ✅ Completa

Tabla con búsqueda/filtros (sucursal, cargo, estado), paginación
client-side, acciones (ver detalle, editar, desactivar).

### HU40 "Detalle de un empleado" — ✅ Completa

Reutiliza el modal de registro/edición de HU39 en modo `soloLectura`, con
botón "Actualizar" dentro del mismo modal que habilita la edición (no hay
vista de detalle separada ni botones de editar/ver separados en la tabla —
se intentó esa variante y se revirtió, un solo ícono "ver detalle" en la
tabla).

### HU41 "Parametrización de cargos" / "Registrar préstamos" — ✅ De Tatiana

Features `cargos` y `prestamos`, ya mergeados a `develop`. Referencia de
patrón para features nuevos.

### HU12 "Registrar incapacidades de empleados" — ✅ Completa y mergeada (PR 23)

Feature `incapacidades`: formulario de registro (empleado activo, tipo con
catálogo fijo + campo libre cuando es "Otros", fechas, cálculo de días en
vivo), ruta propia `/incapacidades` (ítem de primer nivel del sidebar,
`adminOnly: true`).

### HU42 "Consultar incapacidades" — ✅ Completa y mergeada (PR 32)

Mismo feature `incapacidades`, ampliado: tabla de listado (documento,
nombre, cargo, estado, fechas, días, tipo), 2 cards de indicadores
(incapacidades activas, total de días activos), filtros (nombre, documento,
cargo, estado, rango de fechas con validación), botón "Registrar
incapacidad" conectado para refrescar tabla + indicadores al crear,
paginación client-side.

**Fuera de alcance, otra historia (HU40):** "Estado de préstamos" en el
detalle de empleado — ya no aplica el gap, el feature `prestamos` de
Tatiana lo resolvió en HU41.

### HU04/HU05 "Historial de asistencia" / "Ingresos del día en tiempo real" — ✅ De Tatiana (PR 28, 30)

### HU17 "Calcular deducciones legales" / HU37, HU39, HU45 "Configurar parámetros de nómina" — ✅ De Marisol (PR 37, 39, 41, 43)

Feature `parametros-nomina`: jornada laboral, recargos, descuentos legales.
`src/features/parametros-nomina/services/workdayConfigService.ts` y sus
`interfaces/types.ts` se reutilizan directo desde HU09 (ver abajo) — no se
duplicaron.

### HU09 "Modificar horario laboral de empleado" — ✅ Completa y mergeada (PR 44)

Feature `empleados`: el selector "Horario laboral" (antes deshabilitado,
placeholder) ahora consulta
`parametros-nomina/services/workdayConfigService.ts` (de Marisol, reutilizado
tal cual, **no** un servicio propio duplicado) y filtra `status ===
"VIGENTE"` en el cliente — Marisol no expone un endpoint dedicado a
"vigente" en el frontend, así que se deriva de `findAll()`. El selector
queda habilitado siempre (decisión explícita, aunque solo haya una opción),
pero respeta `disabled={enviando || soloLectura}` igual que los demás campos
del formulario (hubo un bug real donde esto se les olvidó y el selector
quedaba habilitado incluso en modo solo lectura — ya corregido).

La columna "Horario" de `EmployeeTable` (antes "Próximamente") muestra esa misma
jornada vigente (franja diurna y nocturna) para todos los empleados: `index.tsx`
la pide una vez con `useVigentWorkdayConfig` y se la pasa a la tabla como
`workdayConfig`; sin jornada vigente muestra "—". Prueba:
`empleados/__tests__/EmployeeTable.test.tsx`. Solo frontend, sin cambios de BD.

Se evaluó y se **descartó explícitamente** construir una tabla/lógica de
horario por empleado separada de `parametros-nomina` — la jornada es global
de la empresa (con restricción `EXCLUDE USING gist` en BD que impide
jornadas vigentes solapadas), no por empleado; duplicar esa lógica hubiera
quedado inconsistente con el diseño de Marisol.

### HU20/HU30 "Consultar liquidaciones" / "Comprobante detallado de nómina" — ✅ Completa y mergeada (PR 37)

Feature `liquidaciones`: tabla de listado con filtros (empleado, rango de
período), modal de detalle (`PayrollPeriodDetailDialog.tsx`) con devengados
y deducciones separados. `status` de la liquidación siempre se muestra como
"Confirmada" — así es como lo devuelve el backend, no hay estado real
todavía (ver nota en el `dev_plan.md` del backend).

### HU35 "Consulta de indicadores en dashboard" — ✅ Completa y mergeada (PR 46)

Feature `dashboard`: 3 tarjetas de indicador (asistencia, horas trabajadas,
costos laborales) + 3 gráficos Recharts (barras, dona, línea) + selector de
período (Desde/Hasta + "Consultar", con borrador separado del período
aplicado). Estados explícitos `loading` / `null` ("Sin datos") / valor real
en cada indicador y gráfico — nunca se sustituye un `null` del backend por
`0`. También conecta la tarjeta "Empleados" del dashboard general (antes
hardcodeada a `45`) al conteo real de empleados activos.

### HU29 "Exportar nómina en PDF" — ✅ Completa, en `feature/HU29_Mario` sin PR todavía

Extiende `liquidaciones` (no es feature nuevo). El botón, antes deshabilitado
("Descargar PDF"), ahora se llama **"Generar PDF"** y recicla el mismo
`PayrollPeriodDetailDialog` con un flujo de 3 pasos:

1. "Generar PDF" → `GET /liquidaciones/:id/pdf` (`responseType: "blob"`).
2. Vista previa del PDF en un `<iframe>` dentro del mismo modal (título
   cambia a "Comprobante de pago").
3. "Descargar PDF" descarga **el mismo blob ya generado** (sin volver a
   pedirlo al backend) — garantiza que lo que se ve es lo que se descarga.

Detalles no obvios:
- El modal (`DialogContent`) tiene `resize` + `overflow-auto` + tamaños
  mínimos, para que el usuario pueda arrastrar la esquina y agrandarlo —
  solo en este diálogo, no se tocó el componente `Dialog` compartido. La
  vista previa además arranca con `max-w-4xl` en vez de `max-w-2xl`.
- `toApiError` no sirve tal cual para este endpoint: con `responseType:
  "blob"`, el cuerpo del error también llega como `Blob`, no como JSON, así
  que `payrollPeriodsService.getPdf()` tiene un `toPdfApiError` propio que
  lee el blob como texto y lo parsea antes de caer al mensaje genérico.
- Object URLs (`URL.createObjectURL`) se revocan al desmontar el diálogo o
  al volver del preview al detalle — no se dejan colgados.

**Pendiente, no es tarea de código**: PR de frontend y backend, una vez
Mario confirme que ya probó todo en navegador.

## Pruebas

```
src/features/<dominio>/__tests__/
```

37 suites / 336 tests al momento de esta actualización (2 fallas
preexistentes y ya documentadas, no relacionadas con trabajo reciente:
`navegacion.test.tsx` y `SucursalesFeature.test.tsx`, afectadas por un
refactor de auth de Tatiana — no asumir que son un problema nuevo si
reaparecen).

## Verificación

```bash
npx tsc --noEmit   # type-check, sin emitir
npx vitest run     # tests
```

Mario corre los `git add`/`git commit`/`git push` él mismo — Claude entrega
el comando exacto, nunca los ejecuta directo salvo instrucción explícita.

## Preferencias de trabajo de Mario

Ver la sección equivalente en el `dev_plan.md` del backend — aplican igual
acá: enseñar antes que editar (salvo instrucción explícita o presión de
tiempo), seguir el patrón de Tatiana/Marisol verificando autoría con `git
log` antes de asumir, nombres en inglés, comentarios cortos solo donde
aportan, verificar `tsc`/tests antes de dar algo por terminado, y revisar
que las PR comparen contra `develop` (nunca `main`).

import { useState } from 'react'
import { Link } from 'react-router'
import { ChevronLeft, Pencil, Plus, Power } from 'lucide-react'
import { CargoFormDialog } from '../cargos/CargoFormDialog'
import type { Cargo, CargoInput, FiltroEstado } from '../cargos/types'
import { mensajeDeError, useCargos } from '../cargos/useCargos'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { useSession } from '../session/useSession'
import { useToast } from '../toast/useToast'

const estadoConfig = {
  activo: {
    label: 'Activo',
    badge: 'bg-success-light text-success-dark',
  },
  inactivo: {
    label: 'Inactivo',
    badge: 'bg-secondary-dark text-text-muted',
  },
}

const FILTROS: { value: FiltroEstado; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'activos', label: 'Activos' },
  { value: 'inactivos', label: 'Inactivos' },
]

/** Diálogo abierto en la página; solo puede haber uno a la vez. */
type Dialogo =
  | { tipo: 'crear' }
  | { tipo: 'editar'; cargo: Cargo }
  | { tipo: 'desactivar'; cargo: Cargo }
  | null

/** HU41 — Parametrización de cargos. */
export function CargosPage() {
  const { user } = useSession()

  if (!user || user.rol !== 'administrador') {
    return (
      <article className="w-full max-w-2xl rounded-2xl border border-error-light bg-white p-8 shadow-sm">
        <h1 className="mb-4 text-3xl font-bold text-primary">Cargos</h1>
        <p className="text-base text-text">
          No tienes permisos para administrar el catálogo de cargos.
        </p>
      </article>
    )
  }

  return <CatalogoCargos />
}

function CatalogoCargos() {
  const { showToast } = useToast()
  const [filtro, setFiltro] = useState<FiltroEstado>('todos')
  const [dialogo, setDialogo] = useState<Dialogo>(null)
  const [desactivando, setDesactivando] = useState(false)
  const { cargos, cargando, error, recargar, crear, actualizar, desactivar } =
    useCargos(filtro)

  const cerrarDialogo = () => setDialogo(null)

  async function handleCrear(input: CargoInput) {
    const cargo = await crear(input)
    setDialogo(null)
    showToast(`El cargo "${cargo.name}" se registró correctamente.`, 'success')
  }

  async function handleActualizar(id: number, input: CargoInput) {
    const cargo = await actualizar(id, input)
    setDialogo(null)
    showToast(`El cargo "${cargo.name}" se actualizó correctamente.`, 'success')
  }

  async function handleDesactivar(cargo: Cargo) {
    setDesactivando(true)
    try {
      await desactivar(cargo.id)
      showToast(`El cargo "${cargo.name}" se desactivó correctamente.`, 'success')
    } catch (error) {
      showToast(mensajeDeError(error), 'error')
    } finally {
      setDesactivando(false)
      setDialogo(null)
    }
  }

  return (
    <section className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/configuracion"
          className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-primary-light hover:text-primary"
        >
          <ChevronLeft size={16} aria-hidden="true" />
          Configuración
        </Link>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
              Cargos
            </h1>
            <p className="mt-2 text-sm text-primary-light sm:text-base">
              Catálogo de cargos disponibles para los empleados del restaurante.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setDialogo({ tipo: 'crear' })}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark sm:text-base"
          >
            <Plus size={18} aria-hidden="true" />
            Nuevo cargo
          </button>
        </div>

        <div className="mb-4 flex items-center gap-2">
          <label htmlFor="filtro-estado" className="text-sm font-medium text-text">
            Estado
          </label>
          <select
            id="filtro-estado"
            value={filtro}
            onChange={(event) => setFiltro(event.target.value as FiltroEstado)}
            className="h-10 rounded-xl border border-gray-300 bg-surface px-3 text-sm text-text"
          >
            {FILTROS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <ListadoCargos
          cargos={cargos}
          cargando={cargando}
          error={error}
          onReintentar={recargar}
          onEditar={(cargo) => setDialogo({ tipo: 'editar', cargo })}
          onDesactivar={(cargo) => setDialogo({ tipo: 'desactivar', cargo })}
        />
      </div>

      {dialogo?.tipo === 'crear' && (
        <CargoFormDialog onSubmit={handleCrear} onClose={cerrarDialogo} />
      )}

      {dialogo?.tipo === 'editar' && (
        <CargoFormDialog
          cargo={dialogo.cargo}
          onSubmit={(input) => handleActualizar(dialogo.cargo.id, input)}
          onClose={cerrarDialogo}
        />
      )}

      {dialogo?.tipo === 'desactivar' && (
        <ConfirmDialog
          title="Desactivar cargo"
          message={`¿Deseas desactivar el cargo "${dialogo.cargo.name}"? Dejará de estar disponible para nuevas asignaciones.`}
          confirmLabel="Desactivar"
          busy={desactivando}
          onConfirm={() => void handleDesactivar(dialogo.cargo)}
          onCancel={cerrarDialogo}
        />
      )}
    </section>
  )
}

type ListadoCargosProps = {
  cargos: Cargo[]
  cargando: boolean
  error: string | null
  onReintentar: () => void
  onEditar: (cargo: Cargo) => void
  onDesactivar: (cargo: Cargo) => void
}

function ListadoCargos({
  cargos,
  cargando,
  error,
  onReintentar,
  onEditar,
  onDesactivar,
}: ListadoCargosProps) {
  if (error) {
    return (
      <div
        role="alert"
        className="flex flex-col items-start gap-3 rounded-2xl border border-error-light bg-white p-6"
      >
        <p className="text-base text-error">{error}</p>
        <button
          type="button"
          onClick={onReintentar}
          className="h-10 rounded-xl border border-primary px-4 text-sm font-semibold text-primary hover:bg-primary hover:text-white"
        >
          Reintentar
        </button>
      </div>
    )
  }

  if (cargando && cargos.length === 0) {
    return (
      <p role="status" className="rounded-2xl bg-white p-6 text-text-muted">
        Cargando cargos…
      </p>
    )
  }

  if (cargos.length === 0) {
    return (
      <p className="rounded-2xl bg-white p-6 text-text-muted">
        No hay cargos para mostrar.
      </p>
    )
  }

  return (
    <div
      className="overflow-x-auto rounded-2xl border border-gray-200 bg-surface shadow-sm"
      aria-busy={cargando}
    >
      <table className="w-full text-left text-sm sm:text-base">
        <caption className="sr-only">Catálogo de cargos</caption>
        <thead className="bg-secondary text-xs uppercase tracking-wide text-text-muted">
          <tr>
            <th scope="col" className="px-4 py-3">Nombre</th>
            <th scope="col" className="hidden px-4 py-3 md:table-cell">Descripción</th>
            <th scope="col" className="px-4 py-3">Estado</th>
            <th scope="col" className="px-4 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {cargos.map((cargo) => {
            const estado = estadoConfig[cargo.is_active ? 'activo' : 'inactivo']

            return (
              <tr key={cargo.id} className={cargo.is_active ? '' : 'bg-surface-muted'}>
                <td
                  className={`px-4 py-3 font-medium ${cargo.is_active ? 'text-text' : 'text-text-muted'}`}
                >
                  {cargo.name}
                </td>
                <td className="hidden px-4 py-3 text-text-muted md:table-cell">
                  {cargo.description ?? '—'}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${estado.badge}`}
                  >
                    {estado.label}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEditar(cargo)}
                      aria-label={`Actualizar ${cargo.name}`}
                      title="Actualizar"
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-primary hover:bg-secondary"
                    >
                      <Pencil size={18} aria-hidden="true" />
                    </button>
                    {cargo.is_active && (
                      <button
                        type="button"
                        onClick={() => onDesactivar(cargo)}
                        aria-label={`Desactivar ${cargo.name}`}
                        title="Desactivar"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-error hover:bg-error-light"
                      >
                        <Power size={18} aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

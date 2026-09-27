import { Link } from 'react-router'
import { BriefcaseBusiness, ChevronRight, type LucideIcon } from 'lucide-react'
import type { AppModule } from '../modules/catalog'

type Catalogo = {
  path: string
  label: string
  description: string
  icon: LucideIcon
}

/** Catálogos parametrizables; cada HU de parametrización agrega una entrada. */
const CATALOGOS: readonly Catalogo[] = [
  {
    path: '/configuracion/cargos',
    label: 'Cargos',
    description: 'Cargos disponibles para asignar a los empleados.',
    icon: BriefcaseBusiness,
  },
]

type ConfiguracionPageProps = {
  module: AppModule
}

export function ConfiguracionPage({ module }: ConfiguracionPageProps) {
  return (
    <article className="modulo" aria-labelledby="titulo-modulo">
      <h1 id="titulo-modulo" className="modulo-titulo">
        {module.label}
      </h1>
      <p className="modulo-descripcion">{module.description}</p>

      <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATALOGOS.map(({ path, label, description, icon: Icon }) => (
          <li key={path}>
            <Link
              to={path}
              className="flex h-full items-center gap-4 rounded-2xl border border-gray-200 bg-surface p-4 shadow-sm transition-colors hover:border-primary"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-primary">
                <Icon size={24} aria-hidden="true" />
              </span>
              <span className="flex-1">
                <span className="block text-lg font-semibold text-text">{label}</span>
                <span className="block text-sm text-text-muted">{description}</span>
              </span>
              <ChevronRight size={20} aria-hidden="true" className="text-text-muted" />
            </Link>
          </li>
        ))}
      </ul>
    </article>
  )
}

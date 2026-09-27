import { SectionHeader } from "@/components/atoms/SectionHeader"

import { EmployeeFormModal } from "./components/EmployeeFormModal"

export function EmpleadosFeature() {
  return (
    <section className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <SectionHeader
          eyebrow="Personal"
          title="Empleados"
          description="Gestión de empleados del restaurante."
        />

        <EmployeeFormModal />
      </div>

      {/*
        El listado de empleados (HU39) y el detalle (HU40) se agregan aquí
        como otro componente del feature, sin tocar la cabecera de arriba.
      */}
    </section>
  )
}

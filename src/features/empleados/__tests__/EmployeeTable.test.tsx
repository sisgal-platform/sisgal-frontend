import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { EmployeeTable } from "@/features/empleados/components/EmployeeTable"
import type { Employee } from "@/features/empleados/interfaces/types"
import type { WorkdayConfig } from "@/features/parametros-nomina/interfaces/types"

const JORNADA_VIGENTE: WorkdayConfig = {
  id: 4,
  maxWeekHours: 42,
  maxDayHours: 8,
  dayStart: "06:00",
  dayEnd: "19:00",
  nightStart: "19:00",
  nightEnd: "06:00",
  validFrom: "2026-10-27",
  validTo: null,
  status: "VIGENTE",
}

const EMPLEADO: Employee = {
  id: 1,
  firstName: "Ana",
  lastName: "Barros",
  documentType: "CC",
  document: "1020304059",
  phone: "3001234566",
  salaryBase: 1200000,
  hireDate: "2026-02-15",
  position: "Chef",
  status: "ACTIVO",
  branchId: 3,
  positionId: 4,
  branchName: "Sucursal Centro",
  positionName: "Chef",
}

function renderizarTabla(workdayConfig: WorkdayConfig | null) {
  return render(
    <EmployeeTable
      employees={[EMPLEADO]}
      workdayConfig={workdayConfig}
      cargando={false}
      error={null}
      onReintentar={vi.fn()}
      onVerDetalle={vi.fn()}
      onDesactivar={vi.fn()}
    />,
  )
}

describe("EmployeeTable - columna Horario", () => {
  it("muestra las franjas diurna y nocturna de la jornada vigente", () => {
    renderizarTabla(JORNADA_VIGENTE)

    expect(screen.getByText("Diurna 6:00 a. m. – 7:00 p. m.")).toBeInTheDocument()
    expect(screen.getByText("Nocturna 7:00 p. m. – 6:00 a. m.")).toBeInTheDocument()
    expect(screen.queryByText("Próximamente")).not.toBeInTheDocument()
  })

  it("muestra un guion cuando no hay una jornada vigente configurada", () => {
    renderizarTabla(null)

    expect(screen.queryByText(/Diurna/)).not.toBeInTheDocument()
    // Sucursal y cargo tienen valor: el único guion de la fila es el del horario.
    expect(screen.getAllByText("—")).toHaveLength(1)
  })
})

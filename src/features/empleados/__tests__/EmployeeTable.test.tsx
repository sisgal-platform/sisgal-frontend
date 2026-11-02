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
  workdayConfigId: 4,
}

function renderizarTabla(workdayConfigs: WorkdayConfig[], empleado: Employee = EMPLEADO) {
  return render(
    <EmployeeTable
      employees={[empleado]}
      workdayConfigs={workdayConfigs}
      cargando={false}
      error={null}
      onReintentar={vi.fn()}
      onVerDetalle={vi.fn()}
      onDesactivar={vi.fn()}
    />,
  )
}

describe("EmployeeTable - columna Horario", () => {
  it("muestra las franjas diurna y nocturna de la jornada asignada al empleado", () => {
    renderizarTabla([JORNADA_VIGENTE])

    expect(screen.getByText("Diurna 6:00 a. m. – 7:00 p. m.")).toBeInTheDocument()
    expect(screen.getByText("Nocturna 7:00 p. m. – 6:00 a. m.")).toBeInTheDocument()
    expect(screen.queryByText("Próximamente")).not.toBeInTheDocument()
  })

  it("muestra la jornada asignada aunque ya no sea la vigente", () => {
    const anterior: WorkdayConfig = {
      ...JORNADA_VIGENTE,
      id: 3,
      dayStart: "05:00",
      dayEnd: "21:00",
      nightStart: "21:00",
      nightEnd: "05:00",
      validTo: "2026-10-26",
      status: "HISTORICA",
    }

    renderizarTabla([JORNADA_VIGENTE, anterior], { ...EMPLEADO, workdayConfigId: 3 })

    expect(screen.getByText("Diurna 5:00 a. m. – 9:00 p. m.")).toBeInTheDocument()
    expect(screen.queryByText("Diurna 6:00 a. m. – 7:00 p. m.")).not.toBeInTheDocument()
  })

  it("muestra un guion cuando el empleado no tiene jornada asignada", () => {
    renderizarTabla([JORNADA_VIGENTE], { ...EMPLEADO, workdayConfigId: null })

    expect(screen.queryByText(/Diurna/)).not.toBeInTheDocument()
    // Sucursal y cargo tienen valor: el único guion de la fila es el del horario.
    expect(screen.getAllByText("—")).toHaveLength(1)
  })
})

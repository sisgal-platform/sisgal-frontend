import { describe, expect, it } from "vitest"

import {
  validateEmployeeForm,
  EMPTY_EMPLOYEE_FORM,
} from "@/features/empleados/validation/validateEmployeeForm"
import type { EmployeeFormValues } from "@/features/empleados/validation/validateEmployeeForm"

function crearValores(overrides: Partial<EmployeeFormValues> = {}): EmployeeFormValues {
  return {
    firstName: "Juan",
    lastName: "Pérez",
    documentType: "CC",
    documentNumber: "1020304050",
    phone: "3001234567",
    salaryBase: "1800000",
    hireDate: "2025-08-01",
    positionId: "1",
    branchId: "1",
    ...overrides,
  }
}

describe("validateEmployeeForm", () => {
  it("no reporta errores cuando todos los datos son válidos", () => {
    expect(validateEmployeeForm(crearValores())).toEqual({})
  })

  it("reporta todos los campos obligatorios vacíos", () => {
    const errores = validateEmployeeForm(EMPTY_EMPLOYEE_FORM)

    expect(Object.keys(errores)).toEqual(
      expect.arrayContaining([
        "firstName",
        "lastName",
        "documentType",
        "documentNumber",
        "phone",
        "salaryBase",
        "hireDate",
        "positionId",
        "branchId",
      ]),
    )
  })

  it("rechaza un número de documento con letras", () => {
    const errores = validateEmployeeForm(crearValores({ documentNumber: "12AB" }))

    expect(errores.documentNumber).toBe("El documento debe contener solo dígitos.")
  })

  it("rechaza un teléfono con letras", () => {
    const errores = validateEmployeeForm(crearValores({ phone: "300ABC" }))

    expect(errores.phone).toBe("El teléfono debe contener solo dígitos.")
  })

  it("rechaza un salario igual a cero", () => {
    const errores = validateEmployeeForm(crearValores({ salaryBase: "0" }))

    expect(errores.salaryBase).toBe("El salario debe ser mayor que cero.")
  })

  it("rechaza un salario que no es un número", () => {
    const errores = validateEmployeeForm(crearValores({ salaryBase: "abc" }))

    expect(errores.salaryBase).toBe("El salario debe ser mayor que cero.")
  })

  it("exige la fecha de ingreso", () => {
    const errores = validateEmployeeForm(crearValores({ hireDate: "" }))

    expect(errores.hireDate).toBe("La fecha de ingreso es obligatoria.")
  })

  it("rechaza una fecha de ingreso posterior a hoy", () => {
    const errores = validateEmployeeForm(
      crearValores({ hireDate: "2026-10-20" }),
      "2026-10-19",
    )

    expect(errores.hireDate).toBe("La fecha de ingreso no puede ser posterior a hoy.")
  })

  it("acepta como fecha de ingreso el día de hoy", () => {
    expect(
      validateEmployeeForm(crearValores({ hireDate: "2026-10-19" }), "2026-10-19"),
    ).toEqual({})
  })

  it("rechaza un cargo sin seleccionar", () => {
    const errores = validateEmployeeForm(crearValores({ positionId: "" }))

    expect(errores.positionId).toBe("Selecciona el cargo.")
  })

  it("rechaza un identificador de cargo inválido", () => {
    const errores = validateEmployeeForm(crearValores({ positionId: "0" }))

    expect(errores.positionId).toBe("Selecciona un cargo válido.")
  })

  it("rechaza una sucursal sin seleccionar", () => {
    const errores = validateEmployeeForm(crearValores({ branchId: "" }))

    expect(errores.branchId).toBe("Selecciona la sucursal.")
  })

  it("rechaza un nombre que supera la longitud máxima", () => {
    const errores = validateEmployeeForm(
      crearValores({ firstName: "a".repeat(41) }),
    )

    expect(errores.firstName).toBe("Máximo 40 caracteres.")
  })
})

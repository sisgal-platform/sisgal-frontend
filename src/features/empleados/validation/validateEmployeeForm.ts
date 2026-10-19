import { FIELD_LIMITS } from "../constants/employee"

export type EmployeeFormValues = {
  firstName: string
  lastName: string
  documentType: string
  documentNumber: string
  phone: string
  salaryBase: string
  hireDate: string
  positionId: string
  branchId: string
}

export type EmployeeFormErrors = Partial<Record<keyof EmployeeFormValues, string>>

const SOLO_DIGITOS = /^\d+$/

/** Fecha local de hoy (YYYY-MM-DD), para compararla con un <input type="date">. */
export function fechaLocalHoy(): string {
  const hoy = new Date()
  const mes = String(hoy.getMonth() + 1).padStart(2, "0")
  const dia = String(hoy.getDate()).padStart(2, "0")
  return `${hoy.getFullYear()}-${mes}-${dia}`
}

/**
 * Reglas puras del formulario de registro/edición de empleados.
 * Espejo de las validaciones del backend (DTOs + value objects), para dar
 * feedback inmediato antes de llamar a la API.
 */
export function validateEmployeeForm(
  values: EmployeeFormValues,
  hoy: string = fechaLocalHoy(),
): EmployeeFormErrors {
  const errors: EmployeeFormErrors = {}

  if (!values.firstName.trim()) {
    errors.firstName = "Los nombres son obligatorios."
  } else if (values.firstName.length > FIELD_LIMITS.firstName) {
    errors.firstName = `Máximo ${FIELD_LIMITS.firstName} caracteres.`
  }

  if (!values.lastName.trim()) {
    errors.lastName = "Los apellidos son obligatorios."
  } else if (values.lastName.length > FIELD_LIMITS.lastName) {
    errors.lastName = `Máximo ${FIELD_LIMITS.lastName} caracteres.`
  }

  if (!values.documentType) {
    errors.documentType = "Selecciona el tipo de documento."
  }

  if (!values.documentNumber.trim()) {
    errors.documentNumber = "El número de documento es obligatorio."
  } else if (!SOLO_DIGITOS.test(values.documentNumber)) {
    errors.documentNumber = "El documento debe contener solo dígitos."
  } else if (values.documentNumber.length > FIELD_LIMITS.documentNumber) {
    errors.documentNumber = `Máximo ${FIELD_LIMITS.documentNumber} dígitos.`
  }

  if (!values.phone.trim()) {
    errors.phone = "El teléfono es obligatorio."
  } else if (!SOLO_DIGITOS.test(values.phone)) {
    errors.phone = "El teléfono debe contener solo dígitos."
  } else if (values.phone.length > FIELD_LIMITS.phone) {
    errors.phone = `Máximo ${FIELD_LIMITS.phone} dígitos.`
  }

  const salario = Number(values.salaryBase)
  if (!values.salaryBase.trim()) {
    errors.salaryBase = "El salario es obligatorio."
  } else if (Number.isNaN(salario) || salario <= 0) {
    errors.salaryBase = "El salario debe ser mayor que cero."
  }

  // La prima de servicios es proporcional al tiempo trabajado desde el ingreso.
  if (!values.hireDate) {
    errors.hireDate = "La fecha de ingreso es obligatoria."
  } else if (values.hireDate > hoy) {
    errors.hireDate = "La fecha de ingreso no puede ser posterior a hoy."
  }

  const positionId = Number(values.positionId)
  if (!values.positionId.trim()) {
    errors.positionId = "Selecciona el cargo."
  } else if (!Number.isInteger(positionId) || positionId < 1) {
    errors.positionId = "Selecciona un cargo válido."
  }

  const branchId = Number(values.branchId)
  if (!values.branchId.trim()) {
    errors.branchId = "Selecciona la sucursal."
  } else if (!Number.isInteger(branchId) || branchId < 1) {
    errors.branchId = "Selecciona una sucursal válida."
  }

  return errors
}

export const EMPTY_EMPLOYEE_FORM: EmployeeFormValues = {
  firstName: "",
  lastName: "",
  documentType: "",
  documentNumber: "",
  phone: "",
  salaryBase: "",
  hireDate: "",
  positionId: "",
  branchId: "",
}
